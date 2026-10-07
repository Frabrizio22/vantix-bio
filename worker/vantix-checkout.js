// ============================================================
// Vantix Bio — Cloudflare Worker v2 (+ GA4 server-side purchase)
// Order intake, payment hand-off, payment callback, alerts.
//
// This file is the deployed "vantix-checkout" Worker as of Oct 2 2026, plus the GA4 changes marked "GA4" below.
// Deploy: Cloudflare dashboard > Workers > vantix-checkout > Edit code > paste this file > Deploy.
// New secret needed: GA4_API_SECRET (GA4 Admin > Data streams > Measurement Protocol API secrets).
// New columns needed first: supabase/orders_ga4.sql.
//
// What changed vs v1:
//  * NOTHING sensitive is hard-coded — every secret comes from env (wrangler secrets).
//  * The browser never decides prices. It sends SKUs + quantities + a code;
//    the database (create_order) computes subtotal, discount, shipping, total,
//    fees, costs and stock atomically, and the Bankful Amount is that server total.
//  * The payment callback is signed per order and can only move an order to
//    "review" (or "paid" if AUTO_CONFIRM_BANKFUL=true). It can never downgrade a paid order.
//  * CORS is an allowlist, not "*".
//  * Supabase is the source of truth; Google Sheets (via Apps Script) is a mirror.
// ============================================================

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const SKU_ALIASES = { 'VX-KIT-TISSUE': 'VX-KIT-REPAIR' };   // checkout.html uses both names
const MAX_BODY = 50_000;

// Non-secret settings. Cloudflare variables of the same name override these, so you only need to add the SECRETS in the dashboard.
const DEFAULTS = {
  SITE_URL: 'https://vantixbio.com',
  ALLOWED_ORIGINS: 'https://vantixbio.com,https://www.vantixbio.com',
  SUPABASE_URL: 'https://mxhtxcpqgjmgwnurxguv.supabase.co',
  BANKFUL_GATEWAY: '73922',
  ZELLE_EMAIL: 'vantixbio@gmail.com',
  NOTIFY_SIGNUPS: 'false',
  AUTO_CONFIRM_BANKFUL: 'false', // KEEP 'false' (see wrangler.toml)
  GA4_MEASUREMENT_ID: 'G-BBBNSQT84M', // GA4
};

export default {
  async fetch(request, env0, ctx) {
    const env = { ...DEFAULTS, ...env0 };
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/health') return json({ ok: true }, 200, cors);

      // Bankful server-to-server callback (no browser Origin)
      if (url.pathname.startsWith('/callback')) return await handleCallback(request, url, env, ctx);

      // Admin actions (bearer token)
      if (url.pathname.startsWith('/admin/')) {
        const ar = await handleAdmin(request, url, env, ctx);
        const ah = new Headers(ar.headers);
        for (const k of Object.keys(cors)) ah.set(k, cors[k]);   // lets the admin page at vantixbio.com call these
        return new Response(ar.body, { status: ar.status, headers: ah });
      }

      if (request.method !== 'POST') return new Response('Vantix Bio Worker', { headers: cors });

      // Everything else is a browser POST from our own site
      if (!cors['Access-Control-Allow-Origin']) return json({ status: 'error', message: 'Forbidden' }, 403, cors);

      const raw = await request.text();
      if (raw.length > MAX_BODY) return json({ status: 'error', message: 'Request too large' }, 413, cors);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ status: 'error', message: 'Invalid JSON' }, 400, cors); }
      if (!body || typeof body !== 'object') return json({ status: 'error', message: 'Invalid request' }, 400, cors);

      if (body.action === 'newsletter' || body.action === 'waitlist') return await handleNewsletter(body, env, ctx, cors);
      if (body.action === 'notify' || url.pathname === '/waitlist') return await handleWaitlist(body, env, ctx, cors);

      if (url.pathname === '/bankful' || body.payment_method === 'credit_card' || body.payment_method === 'bankful')
        return await handleOrder(body, 'credit_card', request, env, ctx, cors);
      if (body.payment_method === 'zelle')
        return await handleOrder(body, 'zelle', request, env, ctx, cors);

      return json({ status: 'error', message: 'Unknown request' }, 400, cors);
    } catch (err) {
      console.log('worker error', err && err.message);
      await telegram(env, `⚠️ Worker error: ${String(err && err.message).slice(0, 300)}`);
      return json({ status: 'error', message: 'Something went wrong. Please try again or contact support.' }, 500, cors);
    }
  },
};

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------
async function handleOrder(body, method, request, env, ctx, cors) {
  const v = validateOrder(body);
  if (v.error) return json({ status: 'error', message: v.error }, 400, cors);

  const payload = {
    order_number: v.orderNumber,
    payment_method: method,
    customer_name: v.name, customer_email: v.email, phone: v.phone,
    address: v.address, city: v.city, state: v.state, zip: v.zip,
    discount_code: v.code, referral_source: v.referral,
    items: v.items,
    affirmation: body.affirmation && typeof body.affirmation === 'object' ? body.affirmation : null,
    client_meta: {
      ip: request.headers.get('CF-Connecting-IP') || null,
      ua: (request.headers.get('User-Agent') || '').slice(0, 300),
      country: request.headers.get('CF-IPCountry') || null,
    },
  };

  const res = await rpc(env, 'create_order', { p: payload });
  if (!res.ok) {
    let friendly = friendlyError(res.message);
    // An item we switched to inactive because it is at 0 stock should read "out of stock", not "no longer available".
    if (String(res.message || '').startsWith('unknown_or_inactive_sku')) {
      const names = await soldOutNames(env, v.items);
      if (names.length) friendly = { expected: true, http: 409, text: `Sorry, ${names.join(', ')} ${names.length > 1 ? 'are' : 'is'} out of stock. Please remove ${names.length > 1 ? 'them' : 'it'} from your cart to continue.` };
    }
    if (!friendly.expected) await telegram(env, `⚠️ Order ${v.orderNumber} failed: ${res.message}`);
    else if (res.message.startsWith('invalid_discount_code') || res.message.startsWith('unknown_or_inactive_sku'))
      await telegram(env, `⚠️ Checkout rejected ${v.orderNumber}: ${res.message} (a code/SKU on the site may be missing from the database)`);
    return json({ status: 'error', message: friendly.text }, friendly.http, cors);
  }

  const o = res.data;
  const dup = o.status === 'duplicate';

  if (!dup) {
    ctx.waitUntil(mirror(env, 'mirror_order', {
      order_number: o.order_number, customer_name: v.name, customer_email: v.email, phone: v.phone,
      address: v.address, city: v.city, state: v.state, zip: v.zip,
      items_detail: o.items_detail, quantity: v.items.reduce((s, i) => s + i.qty, 0),
      payment_method: method, subtotal: o.subtotal, discount_code: v.code || '', discount: o.discount,
      shipping: o.shipping, total: o.total, cogs: o.cogs, cc_fees: o.processing_fee,
      payment_status: 'Pending',
    }));
    // GA4: remember which GA visitor/session placed this order, so the purchase can be reported to it once paid.
    ctx.waitUntil(saveGaIds(env, o.order_number, v.ga));
  }

  if (method === 'zelle') {
    return json({
      status: 'success', message: 'Order placed - awaiting Zelle payment',
      order_number: o.order_number, zelle_amount: o.total,
      zelle_email: env.ZELLE_EMAIL || undefined,
    }, 200, cors);
  }

  // Credit card: hand the browser to Bankful's hosted page with the SERVER-computed amount.
  // Bankful hosted-page spec (docs.bankful.com#hosted-payment-page): req_username + transaction_type=CAPTURE + url_* fields,
  // signed with HMAC-SHA256 (key = Bankful password, message = all non-empty fields sorted by name, name+value concatenated).
  // The password stays on the server; only the signature goes to the browser.
  const cbSig = await sign(env, o.order_number);
  const origin = new URL(request.url).origin;
  const nameParts = v.name.split(/\s+/);
  const params = {
    req_username: env.BANKFUL_USERNAME,
    transaction_type: 'CAPTURE',
    amount: Number(o.total).toFixed(2),
    request_currency: 'USD',
    cust_fname: nameParts[0] || v.name,
    cust_lname: nameParts.slice(1).join(' ') || nameParts[0] || v.name,
    cust_email: v.email,
    cust_phone: v.phone.replace(/\D/g, '').slice(-10),
    bill_addr: v.address,
    bill_addr_city: v.city,
    bill_addr_state: v.state,
    bill_addr_zip: v.zip,
    bill_addr_country: 'US',
    xtl_order_id: o.order_number,
    cart_name: 'Hosted-Page',
    url_complete: `${env.SITE_URL}/thank-you.html`,
    url_pending: `${env.SITE_URL}/thank-you.html`,
    url_cancel: `${env.SITE_URL}/checkout.html`,
    url_failed: `${env.SITE_URL}/checkout.html`,
    url_callback: `${origin}/callback/${encodeURIComponent(o.order_number)}/${cbSig}`,
  };
  params.signature = await bankfulSignature(env.BANKFUL_PASSWORD, params);
  return json({
    status: 'redirect',
    hpp_url: 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay',
    hpp_params: params,
    server_total: o.total,
  }, 200, cors);
}

// Verify a Bankful callback signature. Fields are used exactly as sent (name+value, sorted by name, SIGNATURE excluded).
async function verifyBankfulCallback(env, raw) {
  try {
    if (!env.BANKFUL_PASSWORD) return false;
    const given = String(raw.SIGNATURE || raw.signature || raw.Signature || '').toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(given)) return false;
    const fields = {};
    for (const k of Object.keys(raw)) if (k.toLowerCase() !== 'signature') fields[k] = raw[k];
    if (timingSafeEqual(await bankfulSignature(env.BANKFUL_PASSWORD, fields), given)) return true;
    const lower = {}; for (const k of Object.keys(fields)) lower[k.toLowerCase()] = fields[k];
    return timingSafeEqual(await bankfulSignature(env.BANKFUL_PASSWORD, lower), given);
  } catch { return false; }
}

// HMAC-SHA256 hex over the non-empty fields (except "signature") sorted by name, concatenated as name+value.
async function bankfulSignature(password, params) {
  const msg = Object.keys(params).filter((k) => k !== 'signature' && params[k] !== '' && params[k] != null)
    .sort().map((k) => k + params[k]).join('');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function validateOrder(b) {
  const s = (x, max) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
  const name = s(b.customer_name, 120), email = s(b.customer_email, 200).toLowerCase();
  const phone = s(b.phone, 40), address = s(b.address, 200), city = s(b.city, 80);
  const state = s(b.state, 40), zip = s(b.zip, 20);
  const orderNumber = s(b.order_number, 24);
  if (!/^[A-Za-z0-9-]{4,24}$/.test(orderNumber)) return { error: 'Invalid order number. Please try again.' };
  if (!name || !address || !city || !state || !zip) return { error: 'Please fill in all required fields.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (phone.replace(/\D/g, '').length < 10) return { error: 'Please enter a valid phone number.' };
  if (!Array.isArray(b.items) || b.items.length < 1 || b.items.length > 50) return { error: 'Your cart is empty.' };
  const items = [];
  for (const it of b.items) {
    const sku = s(it && it.sku, 40).toUpperCase();
    const qty = Number(it && (it.quantity ?? it.qty));
    if (!sku || !Number.isInteger(qty) || qty < 1 || qty > 100) return { error: 'Invalid cart contents.' };
    items.push({ sku: SKU_ALIASES[sku] || sku, qty });
  }
  const code = s(b.discount_code, 40).toUpperCase() || null;
  return { orderNumber, name, email, phone, address, city, state, zip, items, code, referral: s(b.referral_source, 80) || null, ga: cleanGa(b.ga) };
}

// GA4: accept only values shaped like real GA ids (client_id "1234567890.1234567890", session_id = 10-digit unix time).
function cleanGa(g) {
  const out = {};
  if (g && typeof g === 'object') {
    if (typeof g.client_id === 'string' && /^\d{5,12}\.\d{5,12}$/.test(g.client_id)) out.client_id = g.client_id;
    if (typeof g.session_id === 'string' && /^\d{8,12}$/.test(g.session_id)) out.session_id = g.session_id;
  }
  return out;
}

// Names of cart items that are tracked and at zero stock (active or not), so checkout can say "out of stock".
async function soldOutNames(env, items) {
  try {
    const skus = [...new Set((items || []).map((i) => String(i.sku || '')).filter((s) => /^[A-Za-z0-9._-]+$/.test(s)))];
    if (!skus.length) return [];
    const r = await db(env, `products?sku=in.(${skus.join(',')})&stock_tracked=eq.true&stock=lte.0&select=name`);
    return r.ok ? r.data.map((p) => p.name) : [];
  } catch { return []; }
}

function friendlyError(msg) {
  msg = String(msg || '');
  if (msg.startsWith('out_of_stock')) return { expected: true, http: 409, text: 'Sorry, one of the items in your cart just went out of stock. Please review your cart.' };
  if (msg.startsWith('invalid_discount_code')) return { expected: true, http: 400, text: 'That discount code is not valid.' };
  if (msg.startsWith('unknown_or_inactive_sku')) return { expected: true, http: 400, text: 'An item in your cart is no longer available. Please refresh and try again.' };
  if (msg.startsWith('order_number_in_use')) return { expected: true, http: 409, text: 'Please try placing your order again.' };
  return { expected: false, http: 500, text: 'We could not place your order. Please try again or contact support.' };
}

// ------------------------------------------------------------
// Bankful callback  /callback/<ORDER>/<sig>?OrderNumber=..&Status=..
// ------------------------------------------------------------
async function handleCallback(request, url, env, ctx) {
  const parts = url.pathname.split('/').filter(Boolean);          // ['callback', order, sig]
  if (parts.length !== 3) return new Response('Gone', { status: 410 });
  let order; try { order = decodeURIComponent(parts[1]); } catch { return new Response('Bad request', { status: 400 }); }
  const sig = parts[2];
  if (!(await verify(env, order, sig))) return new Response('Forbidden', { status: 403 });

  // Bankful may call with GET query params or a POST form; accept either, case-insensitively.
  const q = new Map(), raw = {};
  for (const [k, v] of url.searchParams.entries()) { q.set(k.toLowerCase(), v); raw[k] = v; }
  if (request.method === 'POST') {
    const text = await request.text().catch(() => '');
    try { for (const [k, v] of new URLSearchParams(text).entries()) { q.set(k.toLowerCase(), v); raw[k] = v; } } catch {}
    try { const j = JSON.parse(text); for (const [k, v] of Object.entries(j)) { q.set(k.toLowerCase(), String(v)); raw[k] = String(v); } } catch {}
  }
  // Bankful signs its callbacks the same way it signs requests (HMAC-SHA256, key = our Bankful password).
  // A valid signature proves the callback really came from Bankful, so an approved + signed + exact-amount callback can mark the order Paid.
  const sigValid = await verifyBankfulCallback(env, raw);
  const reported = q.get('xtl_order_id') || q.get('ordernumber') || q.get('order_number');
  if (reported && reported !== order) return new Response('Mismatch', { status: 400 });
  const status = (q.get('trans_status_name') || q.get('status') || q.get('transactionstatus') || '').toLowerCase();
  const detail = [...q.entries()].map(([k, v]) => `${k}=${String(v).slice(0, 60)}`).join('&').slice(0, 400);

  // If the callback reports an amount, it must match what we charged; otherwise never auto-confirm.
  const reportedAmt = parseFloat(q.get('trans_value') || q.get('amount') || q.get('transactionamount') || q.get('total') || '');
  let amountOk = true, expectedTotal = null;
  {
    const t = await db(env, `orders?order_number=eq.${encodeURIComponent(order)}&select=total`);
    if (t.ok && t.data[0]) expectedTotal = Number(t.data[0].total);
    if (!Number.isNaN(reportedAmt) && expectedTotal !== null && Math.abs(reportedAmt - expectedTotal) > 0.009) amountOk = false;
  }

  let next = null;
  const approvedOk = q.get('trans_status_name') ? (sigValid && amountOk && !Number.isNaN(reportedAmt) && order === (q.get('xtl_order_id') || '') && (q.get('trans_cur') || 'USD').toUpperCase() === 'USD') : false;
  if (status === 'approved') next = (approvedOk || (env.AUTO_CONFIRM_BANKFUL === 'true' && amountOk)) ? 'paid' : 'review';
  else if (['declined', 'failed', 'error', 'cancelled', 'canceled'].includes(status)) next = 'failed';

  if (next) {
    const res = await rpc(env, 'mark_payment', { p_order_number: order, p_status: next, p_source: 'bankful_callback', p_detail: detail });
    if (res.ok && res.data.changed) {
      if (next === 'paid') ctx.waitUntil(afterPaid(env, order));
      else if (next === 'review') {
        ctx.waitUntil(telegram(env, `💳 Card payment to verify — Bankful reports APPROVED for ${order} (signature ${sigValid ? 'valid' : 'NOT verified'}).\nExpected amount: $${expectedTotal === null ? '?' : expectedTotal.toFixed(2)}${amountOk ? '' : `\n⚠️ Callback reported $${reportedAmt} — DOES NOT MATCH`}\nOpen Bankful and confirm a payment of exactly that amount exists for this order, then mark it paid (POST /admin/confirm-payment). Do not ship before that.`));
        ctx.waitUntil(mirror(env, 'mirror_status', { order_number: order, payment_status: 'Review' }));
      }
      else ctx.waitUntil(mirror(env, 'mirror_status', { order_number: order, payment_status: 'Failed' }));
    }
  } else {
    await telegram(env, `ℹ️ Bankful callback for ${order} with unrecognised status "${status}" (${detail})`);
  }
  // Bankful expects HTTP 200 to acknowledge a POSTed callback; browsers (GET) get sent on to the thank-you page.
  if (request.method === 'POST') return new Response('OK', { status: 200 });
  return Response.redirect(`${env.SITE_URL}/thank-you.html`, 302);
}

// ------------------------------------------------------------
// Admin: POST /admin/confirm-payment  {order_number, status: paid|failed|refunded}
// ------------------------------------------------------------
// Admin access = the shared ADMIN_TOKEN (Sheet / curl) OR a signed-in Supabase user who is listed in the admins table (the admin page).
async function adminAuth(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (env.ADMIN_TOKEN && timingSafeEqual(auth, `Bearer ${env.ADMIN_TOKEN}`)) return true;
  const m = auth.match(/^Bearer ([A-Za-z0-9._-]{20,4000})$/);
  if (!m || !env.SUPABASE_SERVICE_KEY) return false;
  try {
    const u = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${m[1]}` } });
    if (!u.ok) return false;
    const user = await u.json();
    if (!user || !user.id) return false;
    const r = await db(env, `admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`);
    return !!(r.ok && r.data.length);
  } catch { return false; }
}
async function handleAdmin(request, url, env, ctx) {
  if (!(await adminAuth(request, env))) return new Response('Unauthorized', { status: 401 });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (url.pathname === '/admin/ship') return handleShip(request, env, ctx);
  if (url.pathname === '/admin/resend-ga') return handleResendGa(request, env);   // GA4
  if (url.pathname !== '/admin/confirm-payment') return new Response('Not found', { status: 404 });
  const b = await request.json().catch(() => ({}));
  const status = b.status || 'paid';
  const res = await rpc(env, 'mark_payment', { p_order_number: String(b.order_number || ''), p_status: status, p_source: 'admin', p_detail: 'manual confirm' });
  if (!res.ok) return json({ ok: false, error: res.message }, 400);
  if (res.data.changed && status === 'paid') ctx.waitUntil(afterPaid(env, b.order_number));
  if (res.data.changed && status !== 'paid') ctx.waitUntil(mirror(env, 'mirror_status', { order_number: b.order_number, payment_status: status[0].toUpperCase() + status.slice(1) }));
  return json({ ok: true, ...res.data });
}

// ------------------------------------------------------------
// Admin: POST /admin/ship  {order_number, tracking_number, carrier?, label_cost?}
// Only PAID orders can ship. First time -> customer gets the "shipped" email (sent by the Apps Script mirror).
// ------------------------------------------------------------
function detectCarrier(t) {
  if (/^1Z[0-9A-Z]{16}$/i.test(t)) return 'UPS';
  if (/^(94|93|92|95)\d{18,24}$/.test(t) || /^[A-Z]{2}\d{9}US$/i.test(t)) return 'USPS';
  if (/^\d{12}$|^\d{15}$/.test(t)) return 'FedEx';
  return 'USPS';
}
function trackingUrl(carrier, t) {
  const n = encodeURIComponent(t);
  if (carrier === 'UPS') return `https://www.ups.com/track?tracknum=${n}`;
  if (carrier === 'FedEx') return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
}
async function handleShip(request, env, ctx) {
  const b = await request.json().catch(() => ({}));
  const order = String(b.order_number || '').trim();
  const tracking = String(b.tracking_number || '').replace(/[\s-]/g, '');
  let carrier = String(b.carrier || '').trim().toUpperCase();
  carrier = carrier === 'UPS' ? 'UPS' : carrier === 'FEDEX' ? 'FedEx' : carrier === 'USPS' ? 'USPS' : detectCarrier(tracking);
  let label = null;
  if (b.label_cost !== undefined && b.label_cost !== null && String(b.label_cost).trim() !== '') {
    label = Number(String(b.label_cost).replace(/[$,\s]/g, ''));
    if (!Number.isFinite(label) || label < 0) return json({ ok: false, error: 'invalid_label_cost' }, 400);
  }
  const res = await rpc(env, 'mark_shipped', { p_order_number: order, p_tracking: tracking, p_carrier: carrier, p_label_cost: label });
  if (!res.ok) return json({ ok: false, error: res.message }, 400);
  ctx.waitUntil(afterShipped(env, order, tracking, carrier, res.data.first_ship));
  return json({ ok: true, order_number: order, carrier, first_ship: res.data.first_ship, tracking_url: trackingUrl(carrier, tracking) });
}
async function afterShipped(env, orderNumber, tracking, carrier, firstShip) {
  const r = await db(env, `orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*,order_items(*)`);
  const o = r.ok && r.data[0];
  if (!o) return;
  const items_detail = o.order_items.map((i) => `${i.qty}x ${i.name} ($${trimNum(i.unit_price)})`).join('\n');
  await mirror(env, 'mirror_shipped', {
    order_number: o.order_number, tracking_number: tracking, carrier, tracking_url: trackingUrl(carrier, tracking),
    label_cost: o.label_cost, send_email: !!firstShip,
    customer_name: o.customer_name, customer_email: o.customer_email, address: o.address, city: o.city, state: o.state, zip: o.zip,
    items_detail,
  });
}

// Paid: update the sheet + email the customer + tell you (this is the ONLY order alert besides "card payment to verify")
async function afterPaid(env, orderNumber) {
  const r = await db(env, `orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=*,order_items(*)`);
  const o = r.ok && r.data[0];
  if (!o) return;
  const items_detail = o.order_items.map((i) => `${i.qty}x ${i.name} ($${trimNum(i.unit_price)})`).join('\n');
  await mirror(env, 'mirror_status', {
    order_number: o.order_number, payment_status: 'Paid', send_confirmation: true,
    customer_name: o.customer_name, customer_email: o.customer_email, items_detail,
    address: o.address, city: o.city, state: o.state, zip: o.zip, discount_code: o.discount_code || '',
    subtotal: o.subtotal, discount: o.discount, shipping: o.shipping_charged, total: o.total, payment_method: o.payment_method,
  });

  // GA4: report the purchase now that the money is confirmed (never throws, never blocks the alert below).
  await sendGa4Purchase(env, o);

  let influencer = '';
  if (o.discount_code && Number(o.commission) > 0) {
    const p = await db(env, `promo_codes?code=eq.${encodeURIComponent(o.discount_code)}&select=influencer`);
    influencer = (p.ok && p.data[0] && p.data[0].influencer) || '';
  }
  const lowRes = await db(env, 'products?stock_tracked=eq.true&select=sku,name,stock,low_stock_threshold');
  const low = (lowRes.ok ? lowRes.data : []).filter((p) => p.stock <= p.low_stock_threshold);
  const costs = Number(o.cogs) + Number(o.packaging_cost) + Number(o.processing_fee) + Number(o.commission);
  const lines = [
    `✅ PAID ${o.order_number} — $${Number(o.total).toFixed(2)} (${o.payment_method === 'zelle' ? 'Zelle' : 'Card'})`,
    `${o.customer_name} · ${o.city}, ${o.state}`, '', items_detail,
  ];
  if (o.discount_code) lines.push('', `Code ${o.discount_code}: -$${Number(o.discount).toFixed(2)}`);
  if (Number(o.commission) > 0) lines.push(`🤝 ${influencer || 'Influencer'} commission: $${Number(o.commission).toFixed(2)}`);
  lines.push('', o.cogs === null || o.cost_missing ? '⚠️ Some item costs not set — profit incomplete'
    : `Profit before label: $${(Number(o.total) - costs).toFixed(2)}`);
  if (low.length) lines.push('', ...low.map((p) => `📉 ${p.name}: ${p.stock} left`));
  await telegram(env, lines.join('\n'));
}

// ------------------------------------------------------------
// GA4 server-side purchase (Measurement Protocol)
// Fires once per order when it becomes PAID (card callback verified, or Zelle/review confirmed by you).
// Needs secret GA4_API_SECRET. Without it this does nothing, so deploying the Worker first is safe.
// ------------------------------------------------------------
async function saveGaIds(env, orderNumber, ga) {
  try {
    if (!ga || !ga.client_id) return;
    const r = await dbPatch(env, `orders?order_number=eq.${encodeURIComponent(orderNumber)}`, {
      ga_client_id: ga.client_id, ga_session_id: ga.session_id || null,
    });
    if (!r.ok) console.log('saveGaIds failed (run supabase/orders_ga4.sql?)', r.status);
  } catch (e) { console.log('saveGaIds error', e.message); }
}

// opts.force: send even if already sent. opts.debug: validate with Google's debug endpoint instead of sending.
async function sendGa4Purchase(env, o, opts = {}) {
  try {
    if (!env.GA4_API_SECRET) return { sent: false, reason: 'GA4_API_SECRET not set' };
    if (o.ga_purchase_sent_at && !opts.force && !opts.debug) return { sent: false, reason: 'already sent' };

    const items = (o.order_items || []).map((i) => ({
      item_id: i.sku, item_name: i.name, price: Number(i.unit_price), quantity: Number(i.qty),
    }));
    const created = Date.parse(o.created_at || '');
    const ageMs = Date.now() - created;
    const fresh = Number.isFinite(ageMs) && ageMs >= 0 && ageMs < 60 * 3600 * 1000;   // GA4 accepts events up to 72h old

    const params = {
      transaction_id: o.order_number,
      currency: 'USD',
      value: Number(o.total),
      shipping: Number(o.shipping_charged || 0),
      items,
      payment_type: o.payment_method === 'zelle' ? 'zelle' : 'card',
      engagement_time_msec: 100,
    };
    if (o.discount_code) params.coupon = o.discount_code;
    if (o.ga_session_id && fresh) params.session_id = String(o.ga_session_id);   // keeps the visitor's original traffic source

    const body = {
      // No client_id (ad blocker, JS off): still count the revenue, just without attribution.
      client_id: o.ga_client_id || `server.${o.order_number}`,
      events: [{ name: 'purchase', params }],
    };
    if (fresh) body.timestamp_micros = created * 1000;

    const base = opts.debug ? 'https://www.google-analytics.com/debug/mp/collect' : 'https://www.google-analytics.com/mp/collect';
    const r = await fetch(`${base}?measurement_id=${encodeURIComponent(env.GA4_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(env.GA4_API_SECRET)}`, {
      method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body),
    });
    if (opts.debug) {
      const t = await r.text();
      let d; try { d = JSON.parse(t); } catch { d = t.slice(0, 300); }
      return { sent: false, debug: true, status: r.status, validation: d, payload: body };
    }
    if (!r.ok) {
      await telegram(env, `⚠️ GA4 purchase for ${o.order_number} was rejected (HTTP ${r.status}). The order itself is fine.`);
      return { sent: false, reason: `HTTP ${r.status}` };
    }
    const mark = await dbPatch(env, `orders?order_number=eq.${encodeURIComponent(o.order_number)}`, { ga_purchase_sent_at: new Date().toISOString() });
    if (!mark.ok) console.log('could not set ga_purchase_sent_at (run supabase/orders_ga4.sql?)', mark.status);
    return { sent: true, attributed: !!o.ga_client_id, session_attached: !!params.session_id };
  } catch (e) {
    console.log('sendGa4Purchase error', e.message);
    return { sent: false, reason: String(e.message).slice(0, 120) };
  }
}

// POST /admin/resend-ga {order_number, debug?}  — debug:true validates the payload with Google without recording anything.
// Without debug it sends the purchase for real, even if already sent (GA4 de-duplicates on transaction_id), so use it for PAID orders only.
async function handleResendGa(request, env) {
  const b = await request.json().catch(() => ({}));
  const order = String(b.order_number || '').trim();
  const r = await db(env, `orders?order_number=eq.${encodeURIComponent(order)}&select=*,order_items(*)`);
  const o = r.ok && r.data[0];
  if (!o) return json({ ok: false, error: 'order_not_found' }, 404);
  const out = await sendGa4Purchase(env, o, { force: true, debug: !!b.debug });
  return json({ ok: true, order_number: order, ...out });
}

// ------------------------------------------------------------
// Waitlist / newsletter (still mirrored to the Sheet tabs you already use)
// ------------------------------------------------------------
async function handleNewsletter(b, env, ctx, cors) {
  const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ status: 'error', message: 'Invalid email' }, 400, cors);
  ctx.waitUntil(mirror(env, 'newsletter', { email, source: String(b.source || 'website').slice(0, 60) }));
  if (env.NOTIFY_SIGNUPS === 'true') ctx.waitUntil(telegram(env, `📧 New signup: ${email}`));
  return json({ status: 'success', message: 'Subscribed' }, 200, cors);
}
async function handleWaitlist(b, env, ctx, cors) {
  const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ status: 'error', message: 'Invalid email' }, 400, cors);
  const product = String(b.product || b.interests || 'General').slice(0, 80);
  ctx.waitUntil(mirror(env, 'notify', { email, product, source: String(b.source || 'waitlist').slice(0, 60) }));
  if (env.NOTIFY_SIGNUPS === 'true') ctx.waitUntil(telegram(env, `🔔 Waitlist: ${email} for ${product}`));
  return json({ status: 'success', message: 'Added to waitlist' }, 200, cors);
}

// ------------------------------------------------------------
// Notifications + Sheet mirror
// ------------------------------------------------------------
async function mirror(env, action, data) {
  if (!env.SHEET_WEBHOOK_URL) return;
  try {
    const r = await fetch(env.SHEET_WEBHOOK_URL, {
      method: 'POST', headers: JSON_HEADERS, redirect: 'follow',
      body: JSON.stringify({ action, mirror_token: env.SHEET_WEBHOOK_TOKEN, ...data }),
    });
    const t = await r.text();
    if (!r.ok || /"error"/.test(t)) throw new Error(`${r.status} ${t.slice(0, 120)}`);
  } catch (e) {
    console.log('mirror failed', action, e.message);
    await telegram(env, `⚠️ Sheet mirror failed (${action} ${data.order_number || data.email || ''}): ${String(e.message).slice(0, 150)}\nThe order is safe in the database.`);
  }
}

async function telegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: JSON_HEADERS,
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text.slice(0, 3900) }),   // plain text: customer-supplied names can't break formatting
    });
  } catch (e) { console.log('telegram failed', e.message); }
}

// ------------------------------------------------------------
// Supabase (PostgREST) helpers
// ------------------------------------------------------------
function sbHeaders(env) {
  return { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' };
}
async function rpc(env, fn, args) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: sbHeaders(env), body: JSON.stringify(args) });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = null; }
  if (!r.ok) return { ok: false, message: (data && data.message) || text.slice(0, 200) };
  return { ok: true, data };
}
async function db(env, path) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders(env) });
  if (!r.ok) return { ok: false };
  return { ok: true, data: await r.json() };
}
async function dbPatch(env, path, body) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH', headers: { ...sbHeaders(env), Prefer: 'return=minimal' }, body: JSON.stringify(body),
  });
  return { ok: r.ok, status: r.status };
}

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const h = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', Vary: 'Origin' };
  if (origin && allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { ...JSON_HEADERS, ...extra } });
}
const trimNum = (n) => String(Number(n));
async function hmacHex(env, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CALLBACK_SECRET || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function sign(env, order) { return (await hmacHex(env, order)).slice(0, 32); }
async function verify(env, order, sig) {
  if (!env.CALLBACK_SECRET) return false;
  return timingSafeEqual(await sign(env, order), String(sig));
}
function timingSafeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
