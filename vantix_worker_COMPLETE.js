// ============================================
// VANTIX BIO - CLOUDFLARE WORKER
// Payment Processing + Order Routing
// ============================================

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json()
      
      // Route to appropriate handler
      if (body.payment_method === 'bankful') {
        return handleBankfulPayment(body, corsHeaders)
      } else if (body.payment_method === 'zelle') {
        return handleZelleOrder(body, corsHeaders)
      } else if (body.action === 'newsletter') {
        return handleNewsletter(body, corsHeaders)
      } else if (body.action === 'notify') {
        return handleNotify(body, corsHeaders)
      }
      
      return new Response(JSON.stringify({ 
        status: 'error', 
        message: 'Unknown payment method' 
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

  // Handle payment callbacks (GET or POST)
  if (request.url.includes('/callback')) {
    return handleBankfulCallback(request, corsHeaders)
  }

  return new Response('Vantix Bio Worker Active', { 
    headers: corsHeaders 
  })
}

// ============================================
// BANKFUL CREDIT CARD PROCESSING
// ============================================
async function handleBankfulPayment(data, corsHeaders) {
  // First, log order to Google Sheets
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
    items: JSON.stringify(data.items),
    items_detail: data.items_detail,
    subtotal: data.subtotal,
    discount: data.discount,
    shipping: data.shipping,
    total: data.total,
    payment_method: 'credit_card',
    payment_status: 'Pending',
    notes: 'Awaiting Bankful payment'
  }

  // Log to Google Sheets
  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })

  // Create Bankful HPP URL
  const bankfulUrl = 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay'
  const params = new URLSearchParams({
    Gateway: BANKFUL_GATEWAY || '70777',
    Username: BANKFUL_USERNAME,
    Password: BANKFUL_PASSWORD,
    Amount: data.total,
    OrderNumber: data.order_number,
    Email: data.customer_email,
    ReturnURL: 'https://vantixbio.com/thank-you.html',
    CallbackURL: 'https://vantix-checkout.vantixbio.workers.dev/callback'
  })

  return new Response(JSON.stringify({
    status: 'redirect',
    url: `${bankfulUrl}?${params.toString()}`
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

  // Redirect to thank you page
  return Response.redirect('https://vantixbio.com/thank-you.html', 302)
}

// ============================================
// ZELLE ORDER PROCESSING
// ============================================
async function handleZelleOrder(data, corsHeaders) {
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
    items: JSON.stringify(data.items),
    items_detail: data.items_detail,
    subtotal: data.subtotal,
    discount: data.discount,
    shipping: data.shipping,
    total: data.total,
    payment_method: 'zelle',
    payment_status: 'Pending Zelle',
    notes: 'Awaiting Zelle payment'
  }

  // Log to Google Sheets
  const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })

  // Send Telegram notification
  await sendTelegramNotification(data)

  return new Response(JSON.stringify({
    status: 'success',
    message: 'Order placed - awaiting Zelle payment'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// NEWSLETTER SIGNUP
// ============================================
async function handleNewsletter(data, corsHeaders) {
  const newsletterData = {
    action: 'newsletter',
    email: data.email,
    source: data.source || 'website'
  }

  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newsletterData)
  })

  // Send Telegram notification
  await sendTelegramMessage(`📧 New newsletter signup: ${data.email}`)

  return new Response(JSON.stringify({
    status: 'success',
    message: 'Subscribed'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// ============================================
// PRODUCT WAITLIST
// ============================================
async function handleNotify(data, corsHeaders) {
  const notifyData = {
    action: 'notify',
    email: data.email,
    product: data.product
  }

  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notifyData)
  })

  // Send Telegram notification
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
  const message = `🔔 *New Vantix Order*\n\n` +
    `Order: ${data.order_number}\n` +
    `Customer: ${data.customer_name}\n` +
    `Email: ${data.customer_email}\n` +
    `Total: $${parseFloat(data.total).toFixed(2)}\n` +
    `Payment: ${data.payment_method}\n\n` +
    `Items:\n${data.items_detail || 'N/A'}`

  await sendTelegramMessage(message)
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  })
}
