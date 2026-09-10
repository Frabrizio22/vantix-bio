// CORRECT transformation function for array-based API data

function transformApiData(apiData) {
  // API returns arrays: {orders: [[]], batches: [[]], expenses: [[]]}\n  console.log('API returned:', apiData.orders?.length, 'orders,', apiData.batches?.length, 'batches');
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Parse orders (array format)
  // [0:orderNum, 1:timestamp, 2:email, 3:name, 4:phone, 5:address, 6:city, 7:state, 8:zip,
  //  9:product, 10:qty, 11:payment, 12:total, 13:discount_code, 14:discount, 15:shipping,
  //  16:final_total, 17:cogs, 18:cc_fees, 19:ship_cost, 20:net_profit, 21:status]
  const ordersRaw = apiData.orders || [];
  const batchesRaw = apiData.batches || [];
  
  let todayRevenue = 0, todayOrders = 0;
  let yesterdayRevenue = 0, yesterdayOrders = 0;
  let last7Revenue = 0, last30Revenue = 0;
  let pendingOrders = [];
  let allOrders = [];
  
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const last7Start = new Date(todayStart);
  last7Start.setDate(last7Start.getDate() - 7);
  const last30Start = new Date(todayStart);
  last30Start.setDate(last30Start.getDate() - 30);
  
  ordersRaw.forEach(row => {
    const orderNum = row[0];
    const timestamp = row[1];
    const email = row[2];
    const name = row[3];
    const product = row[9];
    const total = parseFloat(row[12]) || 0;
    const status = (row[21] || '').toString().toLowerCase();
    const date = new Date(timestamp);
    
    const orderObj = {
      orderNum: orderNum,
      date: timestamp,
      customer: name,
      email: email,
      product: product,
      total: total,
      status: status
    };
    
    allOrders.push(orderObj);
    
    // Calculate metrics
    if (date >= todayStart) {
      todayRevenue += total;
      todayOrders++;
    }
    if (date >= yesterdayStart && date < todayStart) {
      yesterdayRevenue += total;
      yesterdayOrders++;
    }
    if (date >= last7Start) {
      last7Revenue += total;
    }
    if (date >= last30Start) {
      last30Revenue += total;
    }
    
    if (status === 'pending' || status === 'paid' || status === '') {
      pendingOrders.push(orderObj);
    }
  });
  
  const revenueChange = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
    : 0;
  
  // Parse batches (array format)
  // [0:batch_id, 1:date_received, 2:product_name, 3:supplier, 4:supplier_batch, 5:vials_total,
  //  6:total_cost, 7:cost_per_vial, 8:cost_with_testing, 9:vials_remaining, 10:coa_link,
  //  11:coa_uploaded, 12:status, 13:storage_location, 14:notes, 15:restock_threshold, ...] 
  let totalVials = 0;
  let lowStockItems = [];
  
  batchesRaw.forEach(row => {
    const batchId = row[0];
    const product = row[2];
    const remaining = parseInt(row[9]) || 0;
    const status = (row[12] || '').toString().toLowerCase();
    
    if (status === 'active' || status === 'in stock') {
      totalVials += remaining;
      
      if (remaining < 20) {
        lowStockItems.push({
          batchId: batchId,
          product: product,
          remaining: remaining,
          threshold: 10,
          status: remaining === 0 ? 'out' : remaining < 10 ? 'critical' : 'low'
        });
      }
    }
  });
  
  console.log('Transformed:', {
    todayRevenue,
    todayOrders,
    totalVials,
    pendingCount: pendingOrders.length,
    lowStockCount: lowStockItems.length
  });
  
  return {
    overview: {
      today: {
        revenue: todayRevenue,
        orders: todayOrders,
        revenueChange: revenueChange,
        ordersChange: 0
      },
      yesterday: {
        revenue: yesterdayRevenue,
        orders: yesterdayOrders
      },
      last7days: {
        revenue: last7Revenue,
        orders: 0,
        avgDailyRevenue: (last7Revenue / 7).toFixed(2)
      },
      last30days: {
        revenue: last30Revenue,
        orders: 0,
        avgDailyRevenue: (last30Revenue / 30).toFixed(2)
      }
    },
    pending: {
      count: pendingOrders.length,
      total: pendingOrders.reduce((sum, o) => sum + o.total, 0),
      orders: pendingOrders
    },
    recent: allOrders.slice(0, 10),
    inventory: {
      totalVials: totalVials,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems
    },
    alerts: [
      ...(pendingOrders.length > 0 ? [{
        type: 'orders',
        severity: pendingOrders.length > 5 ? 'high' : 'normal',
        message: `${pendingOrders.length} pending order${pendingOrders.length > 1 ? 's' : ''} need fulfillment`,
        action: 'View Orders'
      }] : []),
      ...(lowStockItems.length > 0 ? [{
        type: 'inventory',
        severity: 'warning',
        message: `${lowStockItems.length} product${lowStockItems.length > 1 ? 's' : ''} low on stock`,
        action: 'View Inventory'
      }] : [])
    ]
  };
}
