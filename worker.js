// ============================================
// VANTIX BIO - CLOUDFLARE WORKER
// Payment Processing + Order Routing
// ============================================

// Configuration
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec';
const TELEGRAM_BOT_TOKEN = '8478171743:AAFrXkufgw1kRM0PIQxaXOLpYb3jpjDQxvA';
const TELEGRAM_CHAT_ID = '513307658';
const BANKFUL_USERNAME = 'vantixbio@gmail.com';
const BANKFUL_PASSWORD = 'Vantixbio@140';
const BANKFUL_GATEWAY = '73922';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event))
})

async function handleRequest(request, event) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Handle Bankful callback
  if (request.url.includes('/callback')) {
    return handleBankfulCallback(request, corsHeaders)
  }

  if (request.method === 'POST') {
    const url = new URL(request.url)
    
    try {
      const body = await request.json()
      
      // Bankful payment (explicit /bankful path)
      if (url.pathname === '/bankful') {
        return handleBankfulPayment(body, corsHeaders, event)
      }
      
      // Route by payment_method for root URL (checkout.html sends Zelle here)
      if (body.payment_method === 'zelle') {
        return handleZelleOrder(body, corsHeaders)
      }
      if (body.payment_method === 'bankful' || body.payment_method === 'credit_card') {
        return handleBankfulPayment(body, corsHeaders, event)
      }
      
      // Route by action
      if (body.action === 'newsletter' || body.action === 'waitlist') {
        return handleNewsletter(body, corsHeaders)
      }
      if (body.action === 'notify') {
        return handleWaitlist(body, corsHeaders)
      }
      
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Unknown request'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        status: 'error',
        message: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Vantix Bio Worker Active', { 
    headers: corsHeaders 
  })
}

// ============================================
// BANKFUL CREDIT CARD PROCESSING
// ============================================
async function handleBankfulPayment(data, corsHeaders, event) {
  // Format items for display
  let itemsDetail = '';
  if (data.items && data.items.length > 0) {
    itemsDetail = data.items.map(item => 
      `${item.quantity}x ${item.name} ($${item.price})`
    ).join('\n');
  }
  
  // Log order to Google Sheets
  const orderData = {
    action: 'order',
    order_number: data.order_number,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    phone: data.phone,
    items: JSON.stringify(data.items || []),
    items_detail: itemsDetail,
    subtotal: data.subtotal,
    discount_code: data.discount_code || '',
    discount: data.discount || 0,
    shipping: data.shipping || 0,
    total: data.total,
    payment_method: 'Credit Card',
    payment_status: 'Pending'
  }

  // Log to Google Sheets in background (don't block payment redirect)
  const sheetPromise = fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  }).catch(err => console.log('Sheet log error:', err));
  
  if (event && event.waitUntil) {
    event.waitUntil(sheetPromise);
  }

  // Create Bankful HPP URL
  const bankfulUrl = 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay'
  
  return new Response(JSON.stringify({
    status: 'redirect',
    hpp_url: bankfulUrl,
    hpp_params: {
      Gateway: BANKFUL_GATEWAY,
      Username: BANKFUL_USERNAME,
      Password: BANKFUL_PASSWORD,
      Amount: data.total,
      OrderNumber: data.order_number,
      Email: data.customer_email,
      ReturnURL: 'https://vantixbio.com/thank-you.html',
      CallbackURL: 'https://vantix-checkout.prcpeptides.workers.dev/callback'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// BANKFUL PAYMENT CALLBACK
// ============================================
async function handleBankfulCallback(request, corsHeaders) {
  const url = new URL(request.url)
  const orderNumber = url.searchParams.get('OrderNumber')
  const status = url.searchParams.get('Status')

  if (!orderNumber) {
    return new Response('Missing OrderNumber', { 
      status: 400, 
      headers: corsHeaders 
    })
  }

  // Update order status in Google Sheets
  const callbackData = {
    action: 'payment_callback',
    order_number: orderNumber,
    payment_status: status === 'Approved' ? 'Paid' : 'Failed'
  }

  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callbackData)
  })

  // Send Telegram notification if payment approved
  if (status === 'Approved') {
    const message = `💳 *Payment Confirmed*\n\nOrder: ${orderNumber}\nStatus: Paid via Credit Card\n\nCustomer completed Bankful payment successfully.`;
    
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (err) {
      console.log('Telegram notification failed:', err);
    }
  }

  // Redirect to thank you page
  return Response.redirect('https://vantixbio.com/thank-you.html', 302)
}

// ============================================
// ZELLE ORDER PROCESSING
// ============================================
async function handleZelleOrder(data, corsHeaders) {
  let itemsDetail = '';
  if (data.items && data.items.length > 0) {
    itemsDetail = data.items.map(item => 
      `${item.quantity}x ${item.name} ($${item.price})`
    ).join('\n');
  }
  
  const orderData = {
    action: 'order',
    order_number: data.order_number,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    phone: data.phone,
    items: JSON.stringify(data.items || []),
    items_detail: itemsDetail,
    subtotal: data.subtotal,
    discount_code: data.discount_code || '',
    discount: data.discount || 0,
    shipping: data.shipping || 0,
    total: data.total,
    payment_method: 'Zelle',
    payment_status: 'Pending'
  }

  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })

  // Send Telegram notification
  await sendTelegramNotification(data)

  return new Response(JSON.stringify({
    status: 'success',
    message: 'Order placed - awaiting Zelle payment',
    zelle_email: 'vantixbio@gmail.com',
    zelle_amount: data.total
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// NEWSLETTER
// ============================================
async function handleNewsletter(data, corsHeaders) {
  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'newsletter',
      email: data.email,
      source: data.source || 'website'
    })
  })

  await sendTelegramMessage(`📧 New newsletter signup: ${data.email}`)

  return new Response(JSON.stringify({
    status: 'success',
    message: 'Subscribed'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// WAITLIST
// ============================================
async function handleWaitlist(data, corsHeaders) {
  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'notify',
      email: data.email,
      product: data.product
    })
  })

  await sendTelegramMessage(`🔔 Waitlist signup: ${data.email} for ${data.product}`)

  return new Response(JSON.stringify({
    status: 'success',
    message: 'Added to waitlist'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// TELEGRAM NOTIFICATIONS
// ============================================
async function sendTelegramNotification(data) {
  const message = `🛒 *New Vantix Order*\n\nOrder: ${data.order_number}\nCustomer: ${data.customer_name}\nEmail: ${data.customer_email}\nTotal: $${parseFloat(data.total).toFixed(2)}\nPayment: ${data.payment_method}\n\nItems:\n${data.items_detail || 'N/A'}`;
  await sendTelegramMessage(message)
}

async function sendTelegramMessage(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    })
  } catch (err) {
    console.log('Telegram error:', err)
  }
}
