// Vantix Bio Cloudflare Worker - Bankful HPP Integration
// Handles: Bankful signature generation, order logging, Telegram notifications

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxGd-TzTIFXou9Cp7iOpq0qHKLDcTZsDqx9sjMuiNYaeD_kGTGcF7HYK57xfPZ_aM_A4w/exec';
const TELEGRAM_BOT_TOKEN = '8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0';
const TELEGRAM_CHAT_ID = '513307658';
const BANKFUL_USERNAME = 'vantixbio@gmail.com';
const BANKFUL_PASSWORD = 'Vantixbio@140';
const BANKFUL_GATEWAY = '73922';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event))
})

async function handleRequest(request, event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)

  // === BANKFUL CALLBACK ===
  if (url.pathname === '/bankful/callback' && request.method === 'POST') {
    try {
      const formData = await request.formData()
      const params = Object.fromEntries(formData)
      
      const receivedSignature = params.signature
      delete params.signature
      
      const expectedSignature = await generateHmacSignature(params, BANKFUL_PASSWORD)
      
      if (receivedSignature !== expectedSignature) {
        console.error('[BANKFUL CALLBACK] Signature mismatch!')
        return new Response('Invalid signature', { status: 400 })
      }

      const orderNumber = params.XTL_ORDER_ID || params.xtl_order_id
      const status = params.TRANS_STATUS_NAME || params.trans_status_name
      const approved = status === 'APPROVED'

      // Update Google Sheet
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payment_callback',
          order_number: orderNumber,
          payment_status: approved ? 'Paid' : 'Failed'
        })
      })

      // Send Telegram notification if approved
      if (approved) {
        const message = `💳 *Payment Confirmed*\n\nOrder: ${orderNumber}\nStatus: Paid via Credit Card\n\nCustomer completed Bankful payment successfully.`
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        })
      }

      return new Response('OK', { status: 200 })
      
    } catch (error) {
      console.error('[BANKFUL CALLBACK] Error:', error)
      return new Response('Error', { status: 500 })
    }
  }

  // === BANKFUL HPP REQUEST ===
  if (url.pathname === '/bankful' && request.method === 'POST') {
    try {
      const data = await request.json()
      
      // Log order to Google Sheet as Pending
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          items_detail: data.items ? data.items.map(item => 
            `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
          ).join(', ') : '',
          subtotal: data.subtotal,
          discount: data.discount || 0,
          discount_code: data.discount_code || '',
          referral_source: data.referral_source || '',
          shipping: data.shipping || 0,
          total: data.total,
          payment_method: 'Credit Card',
          payment_status: 'Pending'
        })
      })

      // Build HPP parameters (match PRC's exact format)
      const hppParams = {
        req_username: BANKFUL_USERNAME,
        gateway_id: BANKFUL_GATEWAY,
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
        url_failed: 'https://vantixbio.com/thank-you.html',
        url_cancel: 'https://vantixbio.com/checkout.html',
        url_pending: 'https://vantixbio.com/thank-you.html',
        url_callback: 'https://vantix-checkout.prcpeptides.workers.dev/bankful/callback'
      }

      // Remove empty fields
      Object.keys(hppParams).forEach(key => {
        if (!hppParams[key]) delete hppParams[key]
      })

      // Generate signature
      const signature = await generateHmacSignature(hppParams, BANKFUL_PASSWORD)
      hppParams.signature = signature

      return new Response(JSON.stringify({
        success: true,
        hpp_url: 'https://api.paybybankful.com/front-calls/go-in/hosted-page-pay',
        hpp_params: hppParams
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      console.error('[BANKFUL HPP] Error:', error)
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  // === ZELLE ===
  if (request.method === 'POST') {
    try {
      const data = await request.json()
      
      if (data.payment_method === 'zelle') {
        // Fire-and-forget: log to sheet + send Telegram in background
        const bgWork = Promise.all([
          fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
              items_detail: data.items ? data.items.map(item => 
                `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
              ).join(', ') : '',
              subtotal: data.subtotal,
              discount: data.discount || 0,
              discount_code: data.discount_code || '',
              referral_source: data.referral_source || '',
              shipping: data.shipping || 0,
              total: data.total,
              payment_method: 'Zelle',
              payment_status: 'Pending'
            })
          }),
          fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: `🔔 *New Vantix Order*\n\nOrder: ${data.order_number}\nName: ${data.customer_name}\nEmail: ${data.customer_email}\nTotal: $${data.total}\nPayment: Zelle (Pending)`,
              parse_mode: 'Markdown'
          })
        })
        ]).catch(e => console.error('Background error:', e))
        
        event.waitUntil(bgWork)

        return new Response(JSON.stringify({
          status: 'success',
          message: 'Order placed - awaiting Zelle payment'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } catch (error) {
      console.error('[ERROR]', error)
    }
  }

  // === WAITLIST / NOTIFY ===
  if (request.method === 'POST') {
    try {
      const data = await request.json()
      
      if (data.action === 'notify' || data.action === 'waitlist') {
        // Log to Google Sheet
        const sheetPromise = fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        // Send Telegram notification
        const tgPromise = fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `📋 *Waitlist Signup*\n\nEmail: ${data.email}\nProduct: ${data.product}\nSource: ${data.source || 'website'}`,
            parse_mode: 'Markdown'
          })
        })
        
        event.waitUntil(Promise.all([sheetPromise, tgPromise]).catch(e => console.error(e)))
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'Added to waitlist'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (data.action === 'newsletter') {
        const sheetPromise = fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        event.waitUntil(sheetPromise.catch(e => console.error(e)))
        
        return new Response(JSON.stringify({
          status: 'success',
          message: 'Subscribed'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } catch (error) {
      console.error('[ERROR]', error)
    }
  }

  return new Response('Vantix Bio Worker Active', { headers: corsHeaders })
}

async function generateHmacSignature(params, password) {
  const sortedKeys = Object.keys(params).sort()
  const message = sortedKeys.map(key => key + params[key]).join('')
  
  const encoder = new TextEncoder()
  const keyData = encoder.encode(password)
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}
