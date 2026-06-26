// ============================================
// ONE-TIME SCRIPT TO FIX DASHBOARD FORMULAS
// Run this once in Apps Script, then delete
// ============================================

function fixDashboardFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName('Dashboard');
  
  if (!dashboard) {
    Logger.log('Dashboard sheet not found');
    return;
  }
  
  // Fix Total COGS (B20)
  dashboard.getRange('B20').setFormula('=SUM(Orders!R2:R100)');
  
  // Fix Total Shipping Costs (B21)
  dashboard.getRange('B21').setFormula('=SUM(Orders!T2:T100)');
  
  // Fix Total CC Fees (B22)
  dashboard.getRange('B22').setFormula('=SUM(Orders!S2:S100)');
  
  // Fix YOUR NET PROFIT (B25)
  dashboard.getRange('B25').setFormula('=SUM(Orders!U2:U100)');
  
  // Fix Days in Month (B26)
  dashboard.getRange('B26').setFormula('=DAY(EOMONTH(TODAY(),0))');
  
  Logger.log('Dashboard formulas fixed!');
}
