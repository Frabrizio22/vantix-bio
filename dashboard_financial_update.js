// Updated Financial Metrics with YTD and YoY comparison support
// Remove Jessie's 30% split, add year-to-date tracking

function renderFinancialMetrics() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // TODO: Add month/year selector for YoY comparison in Phase 2
  // For now: calculate current month + YTD
  
  // Get current month orders
  const currentMonthOrders = ordersData.filter(row => {
    if (!row[1]) return false;
    const orderDate = new Date(row[1]);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });
  
  // Get YTD orders (Jan 1 - now)
  const ytdOrders = ordersData.filter(row => {
    if (!row[1]) return false;
    const orderDate = new Date(row[1]);
    return orderDate.getFullYear() === currentYear && orderDate <= now;
  });
  
  // Calculate metrics for current month
  const currentMonthMetrics = calculatePeriodMetrics(currentMonthOrders, currentMonth, currentYear);
  
  // Calculate YTD metrics
  const ytdMetrics = calculateYTDMetrics(ytdOrders, currentYear);
  
  // Render P&L with both current month and YTD
  renderProfitLossStatement(currentMonthMetrics, ytdMetrics);
}

function calculatePeriodMetrics(orders, month, year) {
  const reportedMethods = ['Bankful', 'Credit Card', 'Debit Card'];
  const unreportedMethods = ['Zelle', 'Cash', 'Bitcoin', 'Venmo', 'Crypto'];
  
  let ccRevenue = 0;
  let zelleRevenue = 0;
  let totalRefunds = 0;
  let totalMerchantFees = 0;
  let monthlyCOGS = 0;
  
  orders.forEach(row => {
    const total = parseFloat(row[14]) || 0;
    const cogs = parseFloat(row[15]) || 0;
    const refund = parseFloat(row[17]) || 0;
    const paymentMethod = (row[8] || '').toString();
    
    const netRevenue = total - refund;
    totalRefunds += refund;
    monthlyCOGS += cogs;
    
    if (reportedMethods.some(m => paymentMethod.includes(m))) {
      ccRevenue += netRevenue;
      if (total > 0) totalMerchantFees += calculateMerchantFees(total);
    } else if (unreportedMethods.some(m => paymentMethod.includes(m))) {
      zelleRevenue += netRevenue;
    } else {
      ccRevenue += netRevenue;
      if (total > 0) totalMerchantFees += calculateMerchantFees(total);
    }
  });
  
  const totalRevenue = ccRevenue + zelleRevenue;
  const displayRevenue = cleanBooksMode ? ccRevenue : totalRevenue;
  const displayCOGS = cleanBooksMode ? calculateCleanBooksCOGS(orders) : monthlyCOGS;
  
  // Get expenses for this period
  const expenses = getExpensesForPeriod(month, year);
  
  const grossProfit = displayRevenue - displayCOGS;
  const netProfitBeforeTax = grossProfit - expenses.shipping - totalMerchantFees - expenses.operating;
  
  // NO MORE JESSIE SPLIT
  const estimatedTaxes = netProfitBeforeTax * (getTaxRate() / 100);
  const yourNetProfit = netProfitBeforeTax - estimatedTaxes;
  
  return {
    revenue: displayRevenue,
    ccRevenue,
    zelleRevenue,
    cogs: displayCOGS,
    grossProfit,
    shippingCosts: expenses.shipping,
    paymentFees: totalMerchantFees,
    operatingExpenses: expenses.operating,
    netProfitBeforeTax,
    taxes: estimatedTaxes,
    yourNetProfit,
    refunds: totalRefunds
  };
}

function calculateYTDMetrics(orders, year) {
  // Calculate cumulative metrics for entire year to date
  return calculatePeriodMetrics(orders, null, year);
}

function getExpensesForPeriod(month, year) {
  let shipping = 0;
  let operating = 0;
  
  const periodExpenses = expensesData.filter(row => {
    if (!row[0]) return false;
    const expenseDate = new Date(row[0]);
    if (month !== null) {
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    } else {
      // YTD: all expenses this year
      return expenseDate.getFullYear() === year;
    }
  });
  
  periodExpenses.forEach(row => {
    const category = (row[2] || '').toString();
    const amount = parseFloat(row[4]) || 0;
    if (category === 'Shipping') shipping += amount;
    else operating += amount;
  });
  
  return { shipping, operating };
}

function calculateCleanBooksCOGS(orders) {
  const reportedMethods = ['Bankful', 'Credit Card', 'Debit Card'];
  let cogs = 0;
  orders.forEach(row => {
    const paymentMethod = (row[8] || '').toString();
    if (reportedMethods.some(m => paymentMethod.includes(m))) {
      cogs += parseFloat(row[15]) || 0;
    }
  });
  return cogs;
}

function renderProfitLossStatement(currentMonth, ytd) {
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  let html = `
    <div class="statement-header">
      <div class="statement-title">💰 Profit & Loss Statement</div>
      <div class="statement-period">
        <span class="period-label">Current Month:</span> ${monthName}
        <span class="period-label" style="margin-left: 24px">YTD:</span> Jan - ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}
      </div>
    </div>
    
    <table class="statement-table">
      <thead>
        <tr>
          <th>CATEGORY</th>
          <th>CURRENT MONTH</th>
          <th>YTD</th>
          <th>% OF REVENUE</th>
        </tr>
      </thead>
      <tbody>
        <tr class="statement-section">
          <td><strong>Revenue</strong></td>
          <td>$${currentMonth.revenue.toFixed(2)}</td>
          <td>$${ytd.revenue.toFixed(2)}</td>
          <td>100%</td>
        </tr>
        
        <tr>
          <td class="indent">Cost of Goods Sold (COGS)</td>
          <td class="negative">-$${currentMonth.cogs.toFixed(2)}</td>
          <td class="negative">-$${ytd.cogs.toFixed(2)}</td>
          <td>${((currentMonth.cogs / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr class="statement-section">
          <td><strong>Gross Profit</strong></td>
          <td>$${currentMonth.grossProfit.toFixed(2)}</td>
          <td>$${ytd.grossProfit.toFixed(2)}</td>
          <td>${((currentMonth.grossProfit / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr>
          <td class="indent">Shipping Costs</td>
          <td class="negative">-$${currentMonth.shippingCosts.toFixed(2)}</td>
          <td class="negative">-$${ytd.shippingCosts.toFixed(2)}</td>
          <td>${((currentMonth.shippingCosts / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr>
          <td class="indent">Payment Fees (4.4%)</td>
          <td class="negative">-$${currentMonth.paymentFees.toFixed(2)}</td>
          <td class="negative">-$${ytd.paymentFees.toFixed(2)}</td>
          <td>${((currentMonth.paymentFees / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr>
          <td class="indent">Operating Expenses</td>
          <td class="negative">-$${currentMonth.operatingExpenses.toFixed(2)}</td>
          <td class="negative">-$${ytd.operatingExpenses.toFixed(2)}</td>
          <td>${((currentMonth.operatingExpenses / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr class="statement-section">
          <td><strong>Net Profit (Before Tax)</strong></td>
          <td class="positive">$${currentMonth.netProfitBeforeTax.toFixed(2)}</td>
          <td class="positive">$${ytd.netProfitBeforeTax.toFixed(2)}</td>
          <td>${((currentMonth.netProfitBeforeTax / currentMonth.revenue) * 100).toFixed(0)}%</td>
        </tr>
        
        <tr>
          <td class="indent">Estimated Taxes (${getTaxRate()}%)</td>
          <td class="negative">-$${currentMonth.taxes.toFixed(2)}</td>
          <td class="negative">-$${ytd.taxes.toFixed(2)}</td>
          <td>--</td>
        </tr>
        
        <tr class="statement-total">
          <td><strong>Your Net Profit (After Tax)</strong></td>
          <td class="positive"><strong>$${currentMonth.yourNetProfit.toFixed(2)}</strong></td>
          <td class="positive"><strong>$${ytd.yourNetProfit.toFixed(2)}</strong></td>
          <td>--</td>
        </tr>
      </tbody>
    </table>
  `;
  
  document.getElementById('profitLossStatement').innerHTML = html;
}

// Phase 2 TODO: Add month/year selector
// function renderPeriodSelector() {
//   // Dropdown: "April 2026" vs "April 2025" (YoY comparison)
//   // Or "2026" vs "2025" (full year comparison)
// }
