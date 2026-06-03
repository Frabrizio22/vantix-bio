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

  // Handle payment callbacks FIRST (before JSON parsing)
  if (request.url.includes('/callback')) {
    return handleBankfulCallback(request, corsHeaders)
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json()
      
      // Route to appropriate handler
      if (body.payment_method === 'bankful' || body.payment_method === 'credit_card') {
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

  return new Response('Vantix Bio Worker Active', { 
    headers: corsHeaders 
  })
}

// ============================================
// BANKFUL CREDIT CARD PROCESSING
// ============================================
async function handleBankfulPayment(data, corsHeaders) {
  // Log order to Google Sheets first
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
    product_name: data.product_name,
    quantity: data.quantity,
    subtotal: data.subtotal,
    discount: data.discount,
    discount_code: data.discount_code,
    shipping: data.shipping,
    total: data.total,
    payment_method: 'credit_card',
    payment_status: 'Pending',
    notes: 'Awaiting Bankful payment',
    api_key: 'vantix_live_2026_secure_key_abc123'
  };

  await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  // Send Telegram notification for CC orders too
  await sendTelegramNotification({ ...data, payment_method: 'credit_card' });

  // Build HPP parameters (PRC format)
  const hppParams = {
    req_username: BANKFUL_USERNAME,
    gateway_id: BANKFUL_GATEWAY || '73922',
    transaction_type: 'CAPTURE',
    amount: parseFloat(data.total).toFixed(2),
    request_currency: 'USD',
    xtl_order_id: data.order_number,
    cart_name: 'Hosted-Page',
    cust_fname: data.customer_name ? data.customer_name.split(' ')[0] : 'Customer',
    cust_lname: data.customer_name ? data.customer_name.split(' ').slice(1).join(' ') : '',
    cust_email: data.customer_email || '',
    cust_phone: data.phone || '',
    bill_addr: data.address || '',
    bill_addr_city: data.city || '',
    bill_addr_state: data.state || '',
    bill_addr_zip: data.zip || '',
    bill_addr_country: 'US',
    url_complete: 'https://vantixbio.com/thank-you.html',
    url_failed: 'https://vantixbio.com/payment-failed.html',
    url_cancel: 'https://vantixbio.com/payment-cancel.html',
    url_pending: 'https://vantixbio.com/payment-pending.html',
    url_callback: 'https://vantix-checkout.prcpeptides.workers.dev/callback'
  };

  // Remove empty fields
  Object.keys(hppParams).forEach(key => {
    if (!hppParams[key]) delete hppParams[key];
  });

  // Generate HMAC signature
  const signature = await generateHmacSignature(hppParams, BANKFUL_PASSWORD);
  hppParams.signature = signature;

  return new Response(JSON.stringify({
    success: true,
    hpp_url: 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay',
    hpp_params: hppParams
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ============================================
// BANKFUL PAYMENT CALLBACK
// ============================================
async function handleBankfulCallback(request, corsHeaders) {
  try {
    let params = {};
    
    // Try all possible formats Bankful might use
    const url = new URL(request.url);
    
    // 1. Check URL query params (GET-style)
    for (const [key, value] of url.searchParams) {
      params[key] = value;
    }
    
    // 2. Check POST form data
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        for (const [key, value] of formData) {
          params[key] = value;
        }
      } catch (e) {
        // Try JSON body
        try {
          const cloned = request.clone();
          const json = await cloned.json();
          params = { ...params, ...json };
        } catch (e2) {
          // Try text body as URL params
          try {
            const cloned2 = request.clone();
            const text = await cloned2.text();
            const bodyParams = new URLSearchParams(text);
            for (const [key, value] of bodyParams) {
              params[key] = value;
            }
          } catch (e3) {}
        }
      }
    }
    

    
    // Try every possible field name Bankful might use
    const orderNumber = params.XTL_ORDER_ID || params.xtl_order_id || params.OrderNumber || params.order_id || params.orderId || '';
    const status = params.TRANS_STATUS_NAME || params.trans_status_name || params.Status || params.status || params.TransStatus || '';
    const transactionId = params.TRANS_REQUEST_ID || params.trans_request_id || params.TransactionId || params.transaction_id || '';

    if (!orderNumber) {
      await sendTelegramMessage(`⚠️ CALLBACK: No order number found in params`);
      return new Response('Missing order number', { status: 400, headers: corsHeaders });
    }

    // Update order status in Google Sheets
    const callbackData = {
      action: 'payment_callback',
      order_number: orderNumber,
      payment_status: (status === 'APPROVED' || status === 'Approved') ? 'Paid' : 'Failed',
      transaction_id: transactionId || '',
      api_key: 'vantix_live_2026_secure_key_abc123'
    };

    const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callbackData)
    });

    // Send Telegram notification
    if (status === 'APPROVED' || status === 'Approved') {
      await sendTelegramMessage(`💳 Payment APPROVED\n\nOrder: #${orderNumber}\nTransaction: ${transactionId || 'N/A'}`);
    } else {
      await sendTelegramMessage(`❌ Payment ${status || 'UNKNOWN'}\n\nOrder: #${orderNumber}`);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    await sendTelegramMessage(`🚨 CALLBACK ERROR: ${error.message}`);
    return new Response('Callback error', { status: 500, headers: corsHeaders });
  }
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
    product_name: data.product_name,
    quantity: data.quantity,
    subtotal: data.subtotal,
    discount: data.discount,
    discount_code: data.discount_code,
    shipping: data.shipping,
    total: data.total,
    payment_method: 'zelle',
    payment_status: 'Pending Zelle',
    notes: 'Awaiting Zelle payment'
  }

  // Log to Google Sheets
  const sheetData = {
    ...orderData,
    api_key: 'vantix_live_2026_secure_key_abc123'
  };
  const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sheetData)
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
    source: data.source || 'website',
    api_key: 'vantix_live_2026_secure_key_abc123'
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
    product: data.product,
    api_key: 'vantix_live_2026_secure_key_abc123'
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
  
  // Try with Markdown first, fall back to plain text
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  });
  
  // If Markdown fails (special chars), retry without parse_mode
  if (!response.ok) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text
      })
    });
  }
}

// ============================================
// HMAC SIGNATURE GENERATOR (Bankful)
// ============================================
async function generateHmacSignature(params, password) {
  const sortedKeys = Object.keys(params).sort();
  const message = sortedKeys.map(key => key + params[key]).join('');
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(password);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
