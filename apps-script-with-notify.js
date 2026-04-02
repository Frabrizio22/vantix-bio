function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ============================================
    // LAUNCH EMAIL NOTIFICATIONS (Vantix)
    // ============================================
    if (data.action === 'launch_notify') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      var launchSheet = ss.getSheetByName("Launch Emails");
      
      // Create sheet if it doesn't exist
      if (!launchSheet) {
        launchSheet = ss.insertSheet("Launch Emails");
        launchSheet.appendRow(["Timestamp", "Email", "Product", "SKU", "Source", "Status"]);
        // Bold headers
        launchSheet.getRange(1, 1, 1, 6).setFontWeight("bold");
      }
      
      // Check for duplicate email+product
      var existingData = launchSheet.getDataRange().getValues();
      for (var i = 1; i < existingData.length; i++) {
        if (existingData[i][1] === data.email && existingData[i][2] === data.product) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true, 
            message: "Already subscribed"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // Add to sheet
      launchSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.email,
        data.product || "General",
        data.sku || "",
        data.source || "vantix_shop",
        "Subscribed"
      ]);
      
      // Send Telegram notification
      const TELEGRAM_BOT_TOKEN = "8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0";
      const TELEGRAM_CHAT_ID = "513307658";
      
      const telegramMessage = "🔔 LAUNCH EMAIL CAPTURED\n\n" +
        "📧 Email: " + data.email + "\n" +
        "🧬 Product: " + (data.product || "General") + "\n" +
        "📅 Launch: April 13, 2026";
      
      UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage
        })
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ============================================
    // ORDER PROCESSING (PRC)
    // ============================================
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Orders");
    
    const orderNumber = data.orderNumber || data.order_number || "N/A";
    const items = data.items || [];
    const itemCount = items.length.toString();
    const itemsDetail = items.map(item => 
      item.name + " x" + item.quantity
    ).join(", ");
    
    const subtotal = parseFloat(data.subtotal || 0).toFixed(2);
    const discount = parseFloat(data.discount || 0).toFixed(2);
    const shippingMethod = data.shippingMethod || data.shipping_method || "Standard";
    const shippingCost = parseFloat(data.shippingCost || data.shipping_cost || 0).toFixed(2);
    const total = parseFloat(data.total || 0).toFixed(2);
    const paymentMethod = data.paymentMethod || data.payment_method || data.payment || "Unknown";
    const status = "Awaiting Payment";
    
    const customerName = data.customerName || data.customer_name || "N/A";
    const customerEmail = data.customerEmail || data.customer_email || data.email || "N/A";
    const customerPhone = data.customerPhone || data.customer_phone || data.phone || "N/A";
    const address = data.address || "N/A";
    const city = data.city || "N/A";
    const state = data.state || "N/A";
    const zip = data.zip || "N/A";
    const timestamp = new Date();
    
    const rowData = [
      timestamp, orderNumber, customerName, customerEmail, customerPhone,
      address, city, state, zip, itemCount, itemsDetail,
      subtotal, discount, shippingCost, total, paymentMethod, status
    ];
    
    sheet.appendRow(rowData);
    
    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = "8478171743:AAHc9H_QoXNsbaelWNwTrjHbWI_ZmDQY6L0";
    const TELEGRAM_CHAT_ID = "513307658";
    
    const telegramMessage = "🛒 New Order: " + orderNumber + "\n\n" +
      "Customer: " + customerName + "\n" +
      "Email: " + customerEmail + "\n" +
      "Phone: " + customerPhone + "\n\n" +
      "Items (" + itemCount + "): " + itemsDetail + "\n\n" +
      "Subtotal: $" + subtotal + "\n" +
      "Discount: -$" + discount + "\n" +
      "Shipping: $" + shippingCost + " (" + shippingMethod + ")\n" +
      "Total: $" + total + "\n\n" +
      "Payment: " + paymentMethod + "\n" +
      "Status: " + status;
    
    UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage
      })
    });
    
    // Send customer email
    const customerEmailBody = 
      "Thank you for your order!\n\n" +
      "Order Number: " + orderNumber + "\n" +
      "Order Date: " + timestamp.toLocaleDateString() + "\n\n" +
      "ITEMS ORDERED:\n" +
      items.map(function(item) { return "• " + item.name + " x" + item.quantity + " - $" + parseFloat(item.price).toFixed(2); }).join("\n") + "\n\n" +
      "ORDER SUMMARY:\n" +
      "Subtotal: $" + subtotal + "\n" +
      "Discount: -$" + discount + "\n" +
      "Shipping (" + shippingMethod + "): $" + shippingCost + "\n" +
      "-----------------\n" +
      "Total: $" + total + "\n\n" +
      "SHIPPING ADDRESS:\n" +
      customerName + "\n" + address + "\n" + city + ", " + state + " " + zip + "\n" + customerPhone + "\n\n" +
      "PAYMENT METHOD: " + paymentMethod + "\n\n" +
      "We'll send you a shipping notification once your order ships.\n\n" +
      "Questions? Reply to this email or contact support@prcpeptides.com\n\n" +
      "- PRC Peptides Team";
    
    MailApp.sendEmail({
      to: customerEmail,
      subject: "Order Confirmation - " + orderNumber,
      body: customerEmailBody
    });
    
    MailApp.sendEmail({
      to: "support@prcpeptides.com",
      subject: "New Order: " + orderNumber,
      body: customerEmailBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      orderNumber: orderNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
