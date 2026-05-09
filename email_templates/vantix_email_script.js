/**
 * Vantix Bio - Premium Email Confirmation System
 * 
 * Triggers:
 * - Credit card: Only after Bankful payment_callback with status=APPROVED
 * - Zelle: Immediately after order placement
 * 
 * Usage:
 * sendVantixOrderEmail(orderData, paymentMethod, paymentConfirmed)
 */

function sendVantixOrderEmail(orderData, paymentMethod, paymentConfirmed) {
  var template = paymentMethod === 'zelle' 
    ? getZelleTemplate() 
    : getCreditCardTemplate();
  
  // Only send credit card emails if payment is confirmed
  if (paymentMethod === 'credit_card' && !paymentConfirmed) {
    return; // Don't send email until Bankful confirms payment
  }
  
  // Replace placeholders
  var email = template
    .replace(/{{CUSTOMER_NAME}}/g, orderData.name)
    .replace(/{{ORDER_NUMBER}}/g, orderData.orderNumber)
    .replace(/{{ORDER_DATE}}/g, new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
    .replace(/{{ORDER_ITEMS}}/g, formatOrderItems(orderData.items))
    .replace(/{{SUBTOTAL}}/g, orderData.subtotal.toFixed(2))
    .replace(/{{DISCOUNT_LINE}}/g, formatDiscountLine(orderData.discount))
    .replace(/{{SHIPPING}}/g, orderData.shipping.toFixed(2))
    .replace(/{{ZELLE_DISCOUNT}}/g, (orderData.total * 0.05).toFixed(2))
    .replace(/{{TOTAL}}/g, orderData.total.toFixed(2))
    .replace(/{{ADDRESS}}/g, orderData.address)
    .replace(/{{CITY}}/g, orderData.city)
    .replace(/{{STATE}}/g, orderData.state)
    .replace(/{{ZIP}}/g, orderData.zip);
  
  var subject = paymentConfirmed 
    ? 'Payment Confirmed - ' + orderData.orderNumber + ' | Vantix Bio'
    : 'Order Confirmation - ' + orderData.orderNumber + ' | Vantix Bio';
  
  // Send to customer
  MailApp.sendEmail({
    to: orderData.email,
    subject: subject,
    htmlBody: email,
    name: 'Vantix Bio'
  });
  
  // Send copy to support
  MailApp.sendEmail({
    to: 'vantixbio@gmail.com',
    subject: (paymentConfirmed ? '[PAID] ' : '[PENDING] ') + orderData.orderNumber,
    htmlBody: email,
    name: 'Vantix Bio Order System'
  });
}

function formatOrderItems(itemsArray) {
  // itemsArray should be: [{ name, sku, quantity, price }]
  return itemsArray.map(function(item) {
    return '<div class="order-item">' +
      '<div class="item-name">' + item.name + '</div>' +
      '<div class="item-meta">' + item.sku + ' · QTY: ' + item.quantity + ' · $' + item.price.toFixed(2) + '</div>' +
      '</div>';
  }).join('');
}

function formatDiscountLine(discount) {
  if (discount > 0) {
    return '<div class="total-row"><span>Discount</span><span style="color: #7BA88F;">-$' + discount.toFixed(2) + '</span></div>';
  }
  return '';
}

function getCreditCardTemplate() {
  // Paste the full order_confirmation_credit_card.html here
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .email-container { max-width: 600px; margin: 0 auto; background: #FAFAF7; }
  .header { background: #0F1B2D; padding: 32px 24px; text-align: center; }
  .logo { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 600; color: #FAFAF7; letter-spacing: 0.05em; }
  .status-badge { background: #7BA88F; color: #FAFAF7; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 16px; font-weight: 600; }
  .content { padding: 40px 24px; }
  .greeting { font-size: 15px; color: #0A1628; line-height: 1.6; margin-bottom: 24px; }
  .confirmation-box { background: #143054; color: #FAFAF7; padding: 24px; border-radius: 8px; margin: 24px 0; }
  .confirmation-box h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: 300; }
  .order-number { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 600; letter-spacing: 0.05em; }
  .section { background: white; border: 1px solid #E5E5E0; border-radius: 8px; padding: 24px; margin: 24px 0; }
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #3973B0; margin-bottom: 16px; font-weight: 600; }
  .order-item { padding: 12px 0; border-bottom: 1px solid #E5E5E0; }
  .order-item:last-child { border-bottom: none; }
  .item-name { font-weight: 600; color: #0A1628; }
  .item-meta { font-family: 'Courier New', monospace; font-size: 11px; color: rgba(10,22,40,0.6); margin-top: 4px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
  .total-row.grand { font-size: 20px; font-weight: 600; padding-top: 16px; border-top: 2px solid #143054; margin-top: 8px; }
  .address-block { line-height: 1.8; color: #0A1628; }
  .timeline { background: #F0F7FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3973B0; margin: 24px 0; }
  .timeline h3 { margin: 0 0 12px 0; font-size: 14px; color: #143054; }
  .timeline ol { margin: 0; padding-left: 20px; line-height: 2; color: rgba(10,22,40,0.8); }
  .footer { background: #0B2545; color: rgba(255,255,255,0.7); padding: 32px 24px; text-align: center; font-size: 12px; line-height: 1.8; }
  .footer-legal { font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.6; margin-top: 16px; opacity: 0.6; }
  .cta-button { display: inline-block; background: #3973B0; color: #FAFAF7; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
</style>
</head>
<body>
<div class="email-container">
  <div class="header">
    <div class="logo">VANTIX BIO</div>
    <div class="status-badge">✓ Payment Confirmed</div>
  </div>
  <div class="content">
    <div class="greeting">
      <strong>Hi {{CUSTOMER_NAME}},</strong><br><br>
      Your payment has been confirmed and your order is being prepared for shipment. Every batch in your order has been independently verified by Janoshik before release.
    </div>
    <div class="confirmation-box">
      <h2>Order Confirmation</h2>
      <div class="order-number">{{ORDER_NUMBER}}</div>
      <div style="margin-top: 12px; font-size: 13px; opacity: 0.8;">{{ORDER_DATE}}</div>
    </div>
    <div class="section">
      <div class="section-title">Order Details</div>
      {{ORDER_ITEMS}}
    </div>
    <div class="section">
      <div class="section-title">Order Summary</div>
      <div class="total-row"><span>Subtotal</span><span>${{SUBTOTAL}}</span></div>
      {{DISCOUNT_LINE}}
      <div class="total-row"><span>Shipping</span><span>${{SHIPPING}}</span></div>
      <div class="total-row grand"><span>Total</span><span>${{TOTAL}}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Shipping Address</div>
      <div class="address-block">{{CUSTOMER_NAME}}<br>{{ADDRESS}}<br>{{CITY}}, {{STATE}} {{ZIP}}</div>
    </div>
    <div class="timeline">
      <h3>What happens next:</h3>
      <ol>
        <li><strong>Packing:</strong> We're preparing your order now</li>
        <li><strong>Shipping:</strong> Your order will ship within 1 business day</li>
        <li><strong>Tracking:</strong> You'll receive tracking via email once shipped</li>
        <li><strong>Delivery:</strong> Typical delivery is 2-3 business days</li>
      </ol>
    </div>
    <div style="text-align: center; padding: 24px 0;">
      <a href="https://vantixbio.com/verify" class="cta-button">Verify Your Batch →</a>
      <p style="font-size: 13px; color: rgba(10,22,40,0.6); margin-top: 12px;">Scan the QR code on your vial to view the complete Janoshik COA</p>
    </div>
  </div>
  <div class="footer">
    <strong>Questions?</strong><br>
    Reply to this email or contact us at <a href="mailto:vantixbio@gmail.com" style="color: #7BA88F;">vantixbio@gmail.com</a>
    <div class="footer-legal"><strong>RUO</strong> — For research use only. Not for human consumption.<br>Not FDA approved. Research-grade compounds only.<br><br>© 2026 Vantix Bio LLC · Santa Cruz, CA</div>
  </div>
</div>
</body>
</html>`;
}

function getZelleTemplate() {
  // Paste the full order_confirmation_zelle.html here
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
  .email-container { max-width: 600px; margin: 0 auto; background: #FAFAF7; }
  .header { background: #0F1B2D; padding: 32px 24px; text-align: center; }
  .logo { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 600; color: #FAFAF7; letter-spacing: 0.05em; }
  .status-badge { background: #FFC107; color: #0A1628; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 16px; font-weight: 600; }
  .content { padding: 40px 24px; }
  .greeting { font-size: 15px; color: #0A1628; line-height: 1.6; margin-bottom: 24px; }
  .confirmation-box { background: #143054; color: #FAFAF7; padding: 24px; border-radius: 8px; margin: 24px 0; }
  .confirmation-box h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: 300; }
  .order-number { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 600; letter-spacing: 0.05em; }
  .payment-instructions { background: linear-gradient(135deg, #7BA88F 0%, #5A8A75 100%); color: #FAFAF7; padding: 32px 24px; border-radius: 8px; margin: 32px 0; }
  .payment-instructions h3 { margin: 0 0 20px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
  .payment-amount { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 600; margin: 16px 0; }
  .payment-detail { background: rgba(255,255,255,0.15); padding: 16px; border-radius: 6px; margin: 12px 0; }
  .payment-detail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.8; margin-bottom: 4px; }
  .payment-detail-value { font-family: 'Courier New', monospace; font-size: 18px; font-weight: 600; }
  .warning-box { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 16px; margin: 20px 0; color: #856404; border-radius: 4px; }
  .warning-box strong { color: #856404; }
  .section { background: white; border: 1px solid #E5E5E0; border-radius: 8px; padding: 24px; margin: 24px 0; }
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #3973B0; margin-bottom: 16px; font-weight: 600; }
  .order-item { padding: 12px 0; border-bottom: 1px solid #E5E5E0; }
  .order-item:last-child { border-bottom: none; }
  .item-name { font-weight: 600; color: #0A1628; }
  .item-meta { font-family: 'Courier New', monospace; font-size: 11px; color: rgba(10,22,40,0.6); margin-top: 4px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
  .total-row.grand { font-size: 20px; font-weight: 600; padding-top: 16px; border-top: 2px solid #143054; margin-top: 8px; }
  .address-block { line-height: 1.8; color: #0A1628; }
  .footer { background: #0B2545; color: rgba(255,255,255,0.7); padding: 32px 24px; text-align: center; font-size: 12px; line-height: 1.8; }
  .footer-legal { font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.6; margin-top: 16px; opacity: 0.6; }
</style>
</head>
<body>
<div class="email-container">
  <div class="header">
    <div class="logo">VANTIX BIO</div>
    <div class="status-badge">⏳ Awaiting Payment</div>
  </div>
  <div class="content">
    <div class="greeting">
      <strong>Hi {{CUSTOMER_NAME}},</strong><br><br>
      Thank you for your order. Please complete payment using the Zelle instructions below to confirm your order.
    </div>
    <div class="confirmation-box">
      <h2>Order Confirmation</h2>
      <div class="order-number">{{ORDER_NUMBER}}</div>
      <div style="margin-top: 12px; font-size: 13px; opacity: 0.8;">{{ORDER_DATE}}</div>
    </div>
    <div class="payment-instructions">
      <h3>💰 Zelle Payment Instructions</h3>
      <div>Send payment to:</div>
      <div class="payment-amount">${{TOTAL}}</div>
      <div class="payment-detail">
        <div class="payment-detail-label">Zelle Recipient</div>
        <div class="payment-detail-value">(619) 587-1812</div>
      </div>
      <div class="payment-detail">
        <div class="payment-detail-label">Payment Memo (Required)</div>
        <div class="payment-detail-value">{{ORDER_NUMBER}}</div>
      </div>
      <div class="warning-box">
        <strong>⚠️ Important Payment Guidelines:</strong><br>
        • <strong>DO</strong> include your order number ({{ORDER_NUMBER}}) in the memo<br>
        • <strong>DO NOT</strong> mention peptides, product names, or research purposes<br>
        • <strong>DO NOT</strong> include words like "research", "peptide", "compound", etc.<br>
        • Keep the memo as just the order number for fastest processing
      </div>
      <div style="margin-top: 20px; font-size: 13px; line-height: 1.6;">
        <strong>After sending payment:</strong><br>
        Your order will be confirmed within 1 hour and shipped the next business day. You'll receive a confirmation email once we verify your payment.
      </div>
    </div>
    <div class="section">
      <div class="section-title">Order Details</div>
      {{ORDER_ITEMS}}
    </div>
    <div class="section">
      <div class="section-title">Order Summary</div>
      <div class="total-row"><span>Subtotal</span><span>${{SUBTOTAL}}</span></div>
      {{DISCOUNT_LINE}}
      <div class="total-row"><span>Shipping</span><span>${{SHIPPING}}</span></div>
      <div class="total-row"><span style="color: #7BA88F; font-weight: 600;">5% Zelle Discount</span><span style="color: #7BA88F; font-weight: 600;">-${{ZELLE_DISCOUNT}}</span></div>
      <div class="total-row grand"><span>Total (Zelle)</span><span>${{TOTAL}}</span></div>
    </div>
    <div class="section">
      <div class="section-title">Shipping Address</div>
      <div class="address-block">{{CUSTOMER_NAME}}<br>{{ADDRESS}}<br>{{CITY}}, {{STATE}} {{ZIP}}</div>
    </div>
    <div style="background: #F0F7FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3973B0; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #143054;">What happens next:</h3>
      <ol style="margin: 0; padding-left: 20px; line-height: 2; color: rgba(10,22,40,0.8);">
        <li><strong>Send Zelle payment</strong> to (619) 587-1812 with memo: {{ORDER_NUMBER}}</li>
        <li><strong>Confirmation:</strong> We'll verify payment within 1 hour</li>
        <li><strong>Shipping:</strong> Your order ships the next business day</li>
        <li><strong>Tracking:</strong> You'll receive tracking via email once shipped</li>
      </ol>
    </div>
  </div>
  <div class="footer">
    <strong>Questions about payment?</strong><br>
    Reply to this email or contact us at <a href="mailto:vantixbio@gmail.com" style="color: #7BA88F;">vantixbio@gmail.com</a>
    <div class="footer-legal"><strong>RUO</strong> — For research use only. Not for human consumption.<br>Not FDA approved. Research-grade compounds only.<br><br>© 2026 Vantix Bio LLC · Santa Cruz, CA</div>
  </div>
</div>
</body>
</html>`;
}

/**
 * Example usage:
 * 
 * var orderData = {
 *   name: "John Smith",
 *   email: "john@example.com",
 *   orderNumber: "VX-20260507-001",
 *   items: [
 *     { name: "Retatrutide 20mg", sku: "VX-RETA20-001", quantity: 2, price: 68.00 },
 *     { name: "MOTS-c 10mg", sku: "VX-MOTS10-001", quantity: 1, price: 32.00 }
 *   ],
 *   subtotal: 168.00,
 *   discount: 0,
 *   shipping: 8.00,
 *   total: 176.00,
 *   address: "123 Main St",
 *   city: "San Francisco",
 *   state: "CA",
 *   zip: "94102"
 * };
 * 
 * // For Zelle orders (immediate email)
 * sendVantixOrderEmail(orderData, 'zelle', false);
 * 
 * // For credit card orders (only after payment confirmed)
 * sendVantixOrderEmail(orderData, 'credit_card', true);
 */
