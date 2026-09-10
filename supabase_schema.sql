-- Vantix Bio Supabase Database Schema
-- Created: September 7, 2026
-- Purpose: E-commerce backend for peptide orders, inventory, and customers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Shipping address
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  
  -- Order items (JSON array)
  items JSONB NOT NULL,
  items_detail TEXT, -- Human-readable summary
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  discount_code TEXT,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Costs (for profit calculation)
  cogs DECIMAL(10,2), -- Cost of goods sold
  cc_fees DECIMAL(10,2), -- Credit card fees (4.4% + $0.40)
  ship_cost_actual DECIMAL(10,2), -- Actual shipping cost
  
  -- Calculated profit (generated column)
  net_profit DECIMAL(10,2) GENERATED ALWAYS AS 
    (total - COALESCE(cogs, 0) - COALESCE(cc_fees, 0) - COALESCE(ship_cost_actual, 0)) STORED,
  
  -- Payment & status
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, shipped, delivered, refunded
  
  -- Tracking
  tracking_number TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  cogs DECIMAL(10,2), -- Cost per unit
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,
  
  -- Product details
  category TEXT,
  dosage TEXT,
  image_url TEXT,
  product_url TEXT,
  
  -- COA/Batch
  current_batch_id UUID, -- Link to batches table
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_stock ON products(in_stock, stock_quantity);

-- ============================================
-- BATCHES TABLE (Inventory)
-- ============================================
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  batch_number TEXT UNIQUE NOT NULL, -- e.g., VX-RETA20-003
  product_name TEXT NOT NULL,
  
  -- Supplier info
  supplier TEXT DEFAULT 'Dora',
  date_received DATE NOT NULL,
  
  -- Costs
  box_cost DECIMAL(10,2), -- Total cost per box
  vials_per_box INTEGER,
  cost_per_vial DECIMAL(10,2), -- box_cost / vials_per_box
  testing_cost DECIMAL(10,2), -- Janoshik testing
  total_cost_per_vial DECIMAL(10,2), -- cost_per_vial + (testing_cost / vials_per_box)
  
  -- Quantity
  initial_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  
  -- COA links
  coa_purity_url TEXT,
  coa_endotoxin_url TEXT,
  janoshik_verify_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, depleted, recalled
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (current_quantity >= 0),
  CHECK (current_quantity <= initial_quantity)
);

CREATE INDEX idx_batches_product ON batches(product_name, status);
CREATE INDEX idx_batches_status ON batches(status);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  
  -- Aggregated stats
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Dates
  first_order_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  
  -- Tags/notes
  tags TEXT[], -- e.g., ['vip', 'wholesale', 'repeat']
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_orders ON customers(total_orders DESC);

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  email TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  product_name TEXT,
  
  -- Status
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  
  -- Source tracking
  source TEXT, -- 'homepage', 'product_page', 'shop'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_product ON waitlist(product_sku, notified);
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- ============================================
-- NEWSLETTER TABLE
-- ============================================
CREATE TABLE newsletter (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  email TEXT UNIQUE NOT NULL,
  
  -- Preferences
  interests TEXT[], -- e.g., ['glp1', 'tissue-repair', 'news']
  source TEXT,
  
  -- Status
  subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter(email);
CREATE INDEX idx_newsletter_subscribed ON newsletter(subscribed);

-- ============================================
-- ORDER STATUS HISTORY (Audit Trail)
-- ============================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  from_status TEXT,
  to_status TEXT NOT NULL,
  
  changed_by TEXT, -- 'system', 'admin', email
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id, created_at DESC);

-- ============================================
-- INVENTORY MOVEMENTS (Audit Trail)
-- ============================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  movement_type TEXT NOT NULL, -- 'sale', 'adjustment', 'return', 'restock'
  quantity_change INTEGER NOT NULL, -- negative for sales, positive for restocks
  
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  reason TEXT,
  created_by TEXT, -- 'system', email
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movements_batch ON inventory_movements(batch_id, created_at DESC);
CREATE INDEX idx_movements_order ON inventory_movements(order_id);

-- ============================================
-- UPDATED_AT TRIGGER (Auto-update timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Basic Setup
-- ============================================
-- Note: We'll configure detailed RLS policies later
-- For now, disable RLS to allow admin access

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (admin access)
-- Anon key will need specific policies (we'll add later)

-- Temporary: Allow all operations for testing
-- TODO: Replace with proper policies before production
CREATE POLICY "Allow all for now" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON waitlist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for now" ON newsletter FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- We'll import your real Google Sheets data after schema is created
