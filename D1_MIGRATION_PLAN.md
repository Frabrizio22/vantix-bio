# Cloudflare D1 Migration Plan - Vantix Bio

## Why D1 Over PostgreSQL

- **Cloudflare D1**: SQLite at edge, zero-latency from Worker, $5/month at scale
- **Postgres**: Separate server, network hop, ~$20-100/month
- **Decision**: D1 is perfect for <10k orders/month, migrate to Postgres if you hit limits

## Database Schema

```sql
-- Orders table with full history
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE, -- Prevents double-submit even if order_number reused
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  
  subtotal_cents INTEGER NOT NULL, -- Store as cents to avoid float errors
  shipping_cents INTEGER NOT NULL,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  
  cogs_cents INTEGER, -- Calculated from batch costs
  cc_fees_cents INTEGER, -- 5% for credit cards
  actual_ship_cost_cents INTEGER, -- Real shipping cost
  net_profit_cents INTEGER, -- total - cogs - fees - ship
  
  payment_method TEXT NOT NULL, -- credit_card, zelle, bitcoin
  current_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, shipped, delivered, refunded
  
  items_json TEXT NOT NULL, -- JSON array of {product, quantity, price, batch_id}
  notes TEXT,
  
  created_at INTEGER NOT NULL DEFAULT (unixepoch()), -- Unix timestamp
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  -- Indexes for common queries
  CHECK (total_cents > 0)
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(current_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_idempotency ON orders(idempotency_key);

-- Order status history (never overwrite - append only)
CREATE TABLE order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by TEXT, -- system, admin, bankful_callback
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id, created_at DESC);

-- Batches (inventory)
CREATE TABLE batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  
  received_date INTEGER NOT NULL, -- Unix timestamp
  
  box_cost_cents INTEGER NOT NULL,
  vials_per_box INTEGER NOT NULL,
  cost_per_vial_cents INTEGER NOT NULL,
  testing_cost_cents INTEGER NOT NULL,
  total_cost_per_vial_cents INTEGER NOT NULL, -- cost_per_vial + (testing / vials_per_box)
  
  initial_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  
  coa_url TEXT,
  qr_code_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, depleted, recalled
  
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  CHECK (current_quantity >= 0),
  CHECK (current_quantity <= initial_quantity)
);

CREATE INDEX idx_batches_product ON batches(product_name, status);
CREATE INDEX idx_batches_status ON batches(status);
CREATE UNIQUE INDEX idx_batches_id ON batches(batch_id);

-- Inventory movements (audit trail)
CREATE TABLE inventory_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  order_id INTEGER, -- NULL for manual adjustments
  
  movement_type TEXT NOT NULL, -- sale, adjustment, return, recall
  quantity_change INTEGER NOT NULL, -- negative for sales, positive for returns
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  reason TEXT,
  created_by TEXT, -- system, admin_email
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  
  FOREIGN KEY (batch_id) REFERENCES batches(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE INDEX idx_movements_batch ON inventory_movements(batch_id, created_at DESC);
CREATE INDEX idx_movements_order ON inventory_movements(order_id);

-- Customers (optional - for faster lookups and email lists)
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  
  total_orders INTEGER DEFAULT 0,
  total_spent_cents INTEGER DEFAULT 0,
  
  first_order_at INTEGER,
  last_order_at INTEGER,
  
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_customers_email ON customers(email);

-- Waitlist
CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  product_name TEXT NOT NULL,
  source TEXT, -- homepage, product_page, shop
  notified BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_waitlist_product ON waitlist(product_name, notified);
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Newsletter
CREATE TABLE newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT,
  subscribed BOOLEAN DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_newsletter_email ON newsletter(email);
```

## Worker Code Changes

```javascript
// worker.js - NEW ORDER HANDLER with D1

async function handleNewOrder(request, env) {
  const data = await request.json();
  
  // Generate idempotency key (client sends this, or we generate from order_number + timestamp)
  const idempotencyKey = data.idempotency_key || `${data.order_number}-${Date.now()}`;
  
  // START TRANSACTION
  const db = env.DB; // D1 binding
  
  try {
    // Check duplicate using UNIQUE constraint (atomic)
    const existing = await db.prepare(
      'SELECT id FROM orders WHERE order_number = ? OR idempotency_key = ?'
    ).bind(data.order_number, idempotencyKey).first();
    
    if (existing) {
      return new Response(JSON.stringify({
        status: 'duplicate',
        message: 'Order already processed'
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Parse items
    const items = JSON.parse(data.items);
    
    // BEGIN TRANSACTION
    await db.prepare('BEGIN TRANSACTION').run();
    
    // For each item, find batch and check stock (with FOR UPDATE equivalent)
    let totalCOGS = 0;
    const batchUpdates = [];
    
    for (const item of items) {
      const batch = await db.prepare(`
        SELECT * FROM batches 
        WHERE product_name LIKE ? 
        AND status = 'active' 
        AND current_quantity >= ?
        ORDER BY received_date ASC
        LIMIT 1
      `).bind(`%${item.name}%`, item.quantity).first();
      
      if (!batch) {
        await db.prepare('ROLLBACK').run();
        return new Response(JSON.stringify({
          status: 'error',
          message: `Insufficient stock for ${item.name}`
        }), { status: 400 });
      }
      
      totalCOGS += batch.total_cost_per_vial_cents * item.quantity;
      
      batchUpdates.push({
        batchId: batch.id,
        batchNumber: batch.batch_id,
        productName: item.name,
        quantity: item.quantity,
        quantityBefore: batch.current_quantity,
        quantityAfter: batch.current_quantity - item.quantity
      });
    }
    
    // Calculate profit
    const totalCents = Math.round(parseFloat(data.total) * 100);
    const ccFees = data.payment_method.includes('credit') ? Math.round(totalCents * 0.05) : 0;
    const actualShipCost = Math.round((parseFloat(data.actual_ship_cost) || 0) * 100);
    const netProfit = totalCents - totalCOGS - ccFees - actualShipCost;
    
    // Insert order
    const orderResult = await db.prepare(`
      INSERT INTO orders (
        order_number, idempotency_key, customer_email, customer_name, customer_phone,
        shipping_address, shipping_city, shipping_state, shipping_zip,
        subtotal_cents, shipping_cents, total_cents, cogs_cents, cc_fees_cents, 
        actual_ship_cost_cents, net_profit_cents, payment_method, current_status, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.order_number, idempotencyKey, data.customer_email, data.customer_name, data.phone,
      data.address, data.city, data.state, data.zip,
      Math.round(parseFloat(data.subtotal) * 100),
      Math.round(parseFloat(data.shipping) * 100),
      totalCents, totalCOGS, ccFees, actualShipCost, netProfit,
      data.payment_method, 'pending', JSON.stringify(items)
    ).run();
    
    const orderId = orderResult.meta.last_row_id;
    
    // Insert status history
    await db.prepare(`
      INSERT INTO order_status_history (order_id, to_status, changed_by)
      VALUES (?, 'pending', 'system')
    `).bind(orderId).run();
    
    // Deduct inventory and log movements
    for (const update of batchUpdates) {
      await db.prepare(`
        UPDATE batches 
        SET current_quantity = ?, 
            status = CASE WHEN ? = 0 THEN 'depleted' ELSE status END,
            updated_at = unixepoch()
        WHERE id = ?
      `).bind(update.quantityAfter, update.quantityAfter, update.batchId).run();
      
      await db.prepare(`
        INSERT INTO inventory_movements 
        (batch_id, order_id, movement_type, quantity_change, quantity_before, quantity_after, created_by)
        VALUES (?, ?, 'sale', ?, ?, ?, 'system')
      `).bind(update.batchId, orderId, -update.quantity, update.quantityBefore, update.quantityAfter).run();
    }
    
    // Update customer stats
    await db.prepare(`
      INSERT INTO customers (email, name, phone, total_orders, total_spent_cents, first_order_at, last_order_at)
      VALUES (?, ?, ?, 1, ?, unixepoch(), unixepoch())
      ON CONFLICT(email) DO UPDATE SET
        total_orders = total_orders + 1,
        total_spent_cents = total_spent_cents + excluded.total_spent_cents,
        last_order_at = unixepoch()
    `).bind(data.customer_email, data.customer_name, data.phone, totalCents).run();
    
    // COMMIT
    await db.prepare('COMMIT').run();
    
    // AFTER COMMIT: Mirror to Google Sheets (fire-and-forget - don't wait)
    mirrorToSheets(env, data, totalCOGS, netProfit).catch(err => {
      console.error('Sheet mirror failed (non-critical):', err);
    });
    
    // Send notifications
    await sendTelegramNotification(env, data, totalCOGS / 100, netProfit / 100);
    
    return new Response(JSON.stringify({
      status: 'success',
      order_id: orderId,
      profit: netProfit / 100
    }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    await db.prepare('ROLLBACK').run();
    console.error('Order processing error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: 'System error'
    }), { status: 500 });
  }
}

// Fire-and-forget Sheet mirror
async function mirrorToSheets(env, orderData, cogs, profit) {
  await fetch(env.GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mirror',
      ...orderData,
      cogs: cogs / 100,
      profit: profit / 100
    })
  });
}
```

## Migration Steps

### 1. Create D1 Database (5 min)
```bash
npx wrangler d1 create vantix-db
# Copy database_id from output

# Add to wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "vantix-db"
database_id = "YOUR_DATABASE_ID"
```

### 2. Run Schema (2 min)
```bash
npx wrangler d1 execute vantix-db --file=schema.sql
```

### 3. Import Existing Orders from Sheets (30 min)
```javascript
// migration_script.js - run once
const orders = /* fetch from Google Sheets */;

for (const order of orders) {
  await db.prepare(`
    INSERT INTO orders (...) VALUES (...)
  `).run();
}
```

### 4. Deploy Worker with D1 Binding (10 min)
```bash
npx wrangler deploy
```

### 5. Test End-to-End (20 min)
- Place test order
- Verify D1 write
- Verify Sheet mirror works
- Verify inventory deducted
- Check Telegram notification

### 6. Go Live (flip DNS or update webhook)

## Rollback Plan

**If D1 fails mid-migration:**

1. **Keep old Apps Script deployed** (don't delete)
2. **Cloudflare Worker has env var**: `USE_D1=false` (defaults to Sheets)
3. **Switch back**:
   ```javascript
   if (env.USE_D1 === 'true') {
     return handleNewOrderD1(request, env);
   } else {
     return handleNewOrderSheets(request, env);
   }
   ```
4. **Data sync**: Export D1 to CSV, import to Sheets

**Dual-write mode (during migration):**
- Write to D1 first
- If success, mirror to Sheets
- If D1 fails, fallback to Sheets
- After 1 week of stable D1, stop writing to Sheets

## Issues That REMAIN After Migration

### P1 - Still Needed
1. **Rate limiting** - D1 doesn't solve brute-force checkout spam
2. **Observability** - Track checkout funnel, success rate
3. **Bulk fulfillment export** - CSV for shipping labels
4. **Customer order lookup** - `/track?order=X` page

### P2 - Nice to Have
5. **PII encryption** - Encrypt customer email/address in D1
6. **Automated backups** - D1 has point-in-time recovery (30 days), but export to S3 weekly
7. **Admin dashboard** - Build proper UI instead of relying on Sheets

## Cost Comparison

### Current (Google Sheets):
- Free up to 100 req/100sec
- **Breaks at ~50 orders/day**

### D1:
- Free tier: 5M reads/day, 100k writes/day
- Paid: $0.50 per million reads
- **Supports 10k orders/day easily**
- **Cost at 1000 orders/month**: ~$0.05

### Postgres (if you outgrow D1):
- Neon: $19/month
- Railway: $20/month
- DigitalOcean: $15/month

## Timeline

- **Today**: Deploy P0 fixes (20 min)
- **Tuesday**: Set up D1, run schema, test locally (2 hours)
- **Wednesday**: Import historical orders, deploy Worker (2 hours)
- **Thursday**: Run parallel for 24h (D1 + Sheets both write)
- **Friday**: Flip to D1-only if no issues
- **Total**: 2 days

## Key Advantages

✅ **Race conditions**: Gone (SQLite ACID transactions)  
✅ **Duplicate prevention**: UNIQUE constraint on idempotency_key  
✅ **Full audit trail**: order_status_history + inventory_movements  
✅ **Fast lookups**: Indexes on all query patterns  
✅ **Scale**: 10k orders/day vs 50/day  
✅ **Sheets still works**: Read-only mirror for familiar admin UI  

## What You DON'T Need Anymore

❌ LockService (D1 handles locking)  
❌ Full column scans (indexed queries)  
❌ Batch caching in KV (D1 queries are fast)  
❌ Dead-letter queue for Sheet writes (Sheets is optional mirror)  
❌ "Limit to 1000 rows" workarounds  

Ready to migrate?
