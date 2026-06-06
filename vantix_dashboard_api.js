// Google Apps Script - Vantix Bio Dashboard API
// Deploy as web app, set permissions to "Anyone"
// Access: /exec?password=VantixDash2026&month=2026-06 (optional month filter)

function doGet(e) {
  // Password protection
  const PASSWORD = 'VantixDash2026';
  const inputPassword = (e && e.parameter && e.parameter.password) || '';
  
  if (inputPassword !== PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Unauthorized',
      message: 'Invalid password'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById('1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs');
  const ordersSheet = ss.getSheetByName('Orders');
  
  const filterMonth = (e && e.parameter && e.parameter.month) || null;
  
  const ordersData = ordersSheet.getDataRange().getValues();
  const headers = ordersData[0];
  const orders = ordersData.slice(1).filter(row => row[0]); // Skip empty rows
  
  // Column indices (match your Vantix sheet)
  const COL_DATE = 0;        // A: Date
  const COL_ORDER_NUM = 1;   // B: Order #
  const COL_CUSTOMER = 2;    // C: Customer
  const COL_EMAIL = 3;       // D: Email
  const COL_ITEMS_DETAIL = 9; // J: Items Detail
  const COL_QTY = 10;        // K: Qty
  const COL_SUBTOTAL = 11;   // L: Subtotal
  const COL_DISCOUNT = 12;   // M: Discount
  const COL_SHIPPING = 13;   // N: Shipping
  const COL_TOTAL = 14;      // O: Total
  const COL_PAYMENT = 15;    // P: Payment
  const COL_STATUS = 16;     // Q: Status
  const COL_COGS = 17;       // R: COGS
  const COL_CC_FEES = 18;    // S: CC Fees
  const COL_NET_PROFIT = 19; // T: Net Profit
  
  function isCompleted(status) {
    const s = String(status).toLowerCase();
    return s === 'paid' || s === 'shipped' || s === 'delivered' || s === 'completed';
  }
  
  function matchesMonth(date, monthFilter) {
    if (!monthFilter) return true;
    if (!(date instanceof Date)) return false;
    const dateMonth = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
    return dateMonth === monthFilter;
  }
  
  // Metrics
  let totalRevenue = 0, totalOrders = 0, totalCOGS = 0, totalCCFees = 0, totalNetProfit = 0;
  let totalDiscount = 0, totalShipping = 0;
  let revenueByMonth = {}, ordersByMonth = {}, profitByMonth = {};
  let paymentBreakdown = { credit_card: 0, zelle: 0, crypto: 0 };
  let paymentCounts = { credit_card: 0, zelle: 0, crypto: 0 };
  let statusCounts = {};
  let productCounts = {}, productRevenue = {};
  let customerSpend = {}, customerOrders = {};
  let discountCodes = {};
  
  // Time-based tracking
  let todayRevenue = 0, todayOrders = 0, todayProfit = 0;
  let yesterdayRevenue = 0, yesterdayOrders = 0;
  let last7Revenue = 0, last7Orders = 0;
  let prev7Revenue = 0, prev7Orders = 0;
  let last30Revenue = 0, last30Orders = 0;
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const last7Start = new Date(todayStart); last7Start.setDate(last7Start.getDate() - 7);
  const prev7Start = new Date(todayStart); prev7Start.setDate(prev7Start.getDate() - 14);
  const last30Start = new Date(todayStart); last30Start.setDate(last30Start.getDate() - 30);
  
  // Recent orders for feed
  let recentOrders = [];
  
  orders.forEach(row => {
    const date = row[COL_DATE];
    const total = parseFloat(row[COL_TOTAL]) || 0;
    const payment = String(row[COL_PAYMENT]).toLowerCase().trim();
    const status = String(row[COL_STATUS]).trim();
    const items = String(row[COL_ITEMS_DETAIL]);
    const customer = String(row[COL_CUSTOMER]).trim();
    const email = String(row[COL_EMAIL]).trim();
    const orderNum = String(row[COL_ORDER_NUM]).trim();
    const cogs = parseFloat(row[COL_COGS]) || 0;
    const ccFees = parseFloat(row[COL_CC_FEES]) || 0;
    const netProfit = parseFloat(row[COL_NET_PROFIT]) || 0;
    const discount = parseFloat(row[COL_DISCOUNT]) || 0;
    const shipping = parseFloat(row[COL_SHIPPING]) || 0;
    
    if (filterMonth && !matchesMonth(date, filterMonth)) return;
    
    // Status counts
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    if (isCompleted(status)) {
      totalRevenue += total;
      totalOrders++;
      totalCOGS += cogs;
      totalCCFees += ccFees;
      totalNetProfit += netProfit;
      totalDiscount += discount;
      totalShipping += shipping;
      
      // Monthly breakdown
      if (date instanceof Date) {
        const mk = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        revenueByMonth[mk] = (revenueByMonth[mk] || 0) + total;
        ordersByMonth[mk] = (ordersByMonth[mk] || 0) + 1;
        profitByMonth[mk] = (profitByMonth[mk] || 0) + netProfit;
        
        // Time periods
        if (date >= todayStart) { todayRevenue += total; todayOrders++; todayProfit += netProfit; }
        else if (date >= yesterdayStart) { yesterdayRevenue += total; yesterdayOrders++; }
        if (date >= last7Start) { last7Revenue += total; last7Orders++; }
        else if (date >= prev7Start) { prev7Revenue += total; prev7Orders++; }
        if (date >= last30Start) { last30Revenue += total; last30Orders++; }
      }
      
      // Payment breakdown
      if (payment.includes('credit') || payment.includes('bankful') || payment.includes('card')) {
        paymentBreakdown.credit_card += total; paymentCounts.credit_card++;
      } else if (payment.includes('zelle')) {
        paymentBreakdown.zelle += total; paymentCounts.zelle++;
      } else if (payment.includes('crypto') || payment.includes('coinbase')) {
        paymentBreakdown.crypto += total; paymentCounts.crypto++;
      }
      
      // Customer tracking
      if (customer) {
        customerSpend[customer] = (customerSpend[customer] || 0) + total;
        customerOrders[customer] = (customerOrders[customer] || 0) + 1;
      }
      
      // Product parsing
      if (items) {
        items.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.length < 3) return;
          // Format: "1x Reta 20mg ($68)" or "Retatrutide 20mg x2 ($62)"
          let productName = trimmed.replace(/\s*\(\$[\d.]+\)\s*$/i, '').trim();
          let quantity = 1;
          const qtyMatch1 = productName.match(/^(\d+)x\s+(.+)/i);
          const qtyMatch2 = productName.match(/(.+?)\s*x(\d+)\s*$/i);
          if (qtyMatch1) { quantity = parseInt(qtyMatch1[1]); productName = qtyMatch1[2].trim(); }
          else if (qtyMatch2) { quantity = parseInt(qtyMatch2[2]); productName = qtyMatch2[1].trim(); }
          if (productName && productName.length > 2 && !/^\d+$/.test(productName)) {
            productCounts[productName] = (productCounts[productName] || 0) + quantity;
          }
        });
      }
    }
    
    // Recent orders (last 20)
    if (recentOrders.length < 20) {
      recentOrders.push({
        date: date instanceof Date ? date.toISOString() : String(date),
        orderNum, customer, email,
        items: items.substring(0, 200),
        total: total.toFixed(2),
        payment, status,
        profit: netProfit.toFixed(2)
      });
    }
  });
  
  // Sort recent orders by date descending
  recentOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Top products
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));
  
  // Top customers
  const topCustomers = Object.entries(customerSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, spent]) => ({ name, spent: spent.toFixed(2), orders: customerOrders[name] || 0 }));
  
  // Growth calculations
  const thisMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const lastMonthNum = now.getMonth() === 0 ? 12 : now.getMonth();
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const lastMonth = lastMonthYear + '-' + String(lastMonthNum).padStart(2, '0');
  
  const thisMonthRevenue = revenueByMonth[thisMonth] || 0;
  const lastMonthRevenue = revenueByMonth[lastMonth] || 0;
  const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
  const weeklyGrowth = prev7Revenue > 0 ? ((last7Revenue - prev7Revenue) / prev7Revenue * 100).toFixed(1) : 0;
  
  // Margin
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue * 100).toFixed(1) : 0;
  const netMargin = totalRevenue > 0 ? (totalNetProfit / totalRevenue * 100).toFixed(1) : 0;
  
  const response = {
    filterMonth,
    metrics: {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00',
      totalCOGS: totalCOGS.toFixed(2),
      totalCCFees: totalCCFees.toFixed(2),
      totalNetProfit: totalNetProfit.toFixed(2),
      grossMargin: parseFloat(grossMargin),
      netMargin: parseFloat(netMargin),
      totalDiscount: totalDiscount.toFixed(2),
      totalShipping: totalShipping.toFixed(2),
      // Time periods
      todayRevenue: todayRevenue.toFixed(2),
      todayOrders,
      todayProfit: todayProfit.toFixed(2),
      yesterdayRevenue: yesterdayRevenue.toFixed(2),
      yesterdayOrders,
      last7Revenue: last7Revenue.toFixed(2),
      last7Orders,
      last30Revenue: last30Revenue.toFixed(2),
      last30Orders,
      // Growth
      thisMonthRevenue: thisMonthRevenue.toFixed(2),
      lastMonthRevenue: lastMonthRevenue.toFixed(2),
      monthlyGrowth: parseFloat(monthlyGrowth),
      weeklyGrowth: parseFloat(weeklyGrowth)
    },
    revenueByMonth: Object.entries(revenueByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2)),
        orders: ordersByMonth[month] || 0,
        profit: parseFloat((profitByMonth[month] || 0).toFixed(2))
      })),
    paymentBreakdown: {
      credit_card: { total: parseFloat(paymentBreakdown.credit_card.toFixed(2)), count: paymentCounts.credit_card },
      zelle: { total: parseFloat(paymentBreakdown.zelle.toFixed(2)), count: paymentCounts.zelle },
      crypto: { total: parseFloat(paymentBreakdown.crypto.toFixed(2)), count: paymentCounts.crypto }
    },
    orderStatus: statusCounts,
    topProducts,
    topCustomers,
    recentOrders,
    lastUpdated: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
