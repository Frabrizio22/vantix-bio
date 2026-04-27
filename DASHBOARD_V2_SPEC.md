# Vantix Dashboard V2 - Enterprise Financial Reporting

## Vision: $0 → $100k/month Ready

Built to scale from pre-launch to 7-figure business without rebuilding.

---

## Core Metrics Architecture

### Time Periods:
1. **Current Month** (default view)
2. **Year-to-Date** (Jan 1 - today)
3. **Last Month** (full prior month)
4. **Last Quarter** (Q1, Q2, Q3, Q4)
5. **Last 12 Months** (rolling)
6. **Custom Date Range** (any start/end)
7. **Year-over-Year Comparison** (Apr 2026 vs Apr 2025)
8. **Quarter-over-Quarter** (Q2 2026 vs Q1 2026)

### Revenue Metrics:
- **Gross Revenue** (all payment methods)
- **Net Revenue** (after refunds)
- **Revenue by Payment Method** (CC, Zelle, Bitcoin, etc.)
- **Revenue by Product** (Reta, Tirz, NAD+, kits, etc.)
- **Revenue by Customer Type** (new vs repeat)
- **Average Order Value** (AOV)
- **Revenue per Day** (daily burn rate)
- **Revenue Growth %** (MoM, YoY)

### Profitability Metrics:
- **Gross Margin** (Revenue - COGS)
- **Gross Margin %** (industry standard: 60-70% is good)
- **Net Profit Before Tax**
- **Net Profit After Tax**
- **Net Margin %** (target: 30-40% for peptides)
- **EBITDA** (optional for future investors)
- **Operating Margin**

### Cost Breakdown:
- **COGS** (product + testing per vial sold)
- **COGS %** (should decrease as you scale - bulk discounts)
- **Shipping Costs** (per order + as % of revenue)
- **Payment Processing Fees** (4.4% + $0.40)
- **Gateway Minimum Shortfall** ($50/month)
- **Operating Expenses by Category:**
  - Marketing/Ads
  - Software/Tools
  - Professional Services
  - Insurance
  - Equipment
  - Office Supplies
  - Miscellaneous

### Customer Metrics:
- **Total Customers** (all-time)
- **New Customers This Period**
- **Repeat Customer Rate** (%)
- **Customer Acquisition Cost** (CAC = Marketing $ ÷ New Customers)
- **Lifetime Value** (LTV = Avg Order × Orders/Year × Avg Years)
- **LTV:CAC Ratio** (target: 3:1 or better)

### Inventory Metrics:
- **Inventory Value** (cost basis of current stock)
- **Days of Inventory** (current stock ÷ avg daily sales)
- **Inventory Turnover Rate** (COGS ÷ Avg Inventory)
- **Stock-Out Events** (times you ran out of hero products)
- **Dead Stock** (inventory not sold in 90+ days)

### Cash Flow Metrics:
- **Cash In** (revenue collected)
- **Cash Out** (COGS + expenses paid)
- **Net Cash Flow** (in - out)
- **Cash Balance** (running total)
- **Runway** (months of expenses you can cover)

### Tax Metrics:
- **Taxable Income** (CC/Bankful revenue only in Clean Books mode)
- **Non-Taxable Income** (Zelle/Cash hidden in Clean Books)
- **Estimated Quarterly Tax** (Federal + State + Self-Employment)
- **Tax Payments Made** (track actual payments)
- **Tax Balance Due** (estimated - paid)

### Product Performance:
- **Units Sold** (by product, by period)
- **Revenue per Product**
- **Margin per Product** (Retail - Cost)
- **Best Sellers** (top 5 by revenue)
- **Worst Performers** (bottom 3 by units)
- **Product Mix %** (hero products vs kits vs accessories)

---

## Dashboard Views

### 1. Executive Summary (Default View)
**Single-page snapshot:**
- Current Month Revenue vs Last Month (% change)
- YTD Revenue vs Last Year YTD (% change)
- Net Profit This Month
- Cash Balance
- Top 3 Products This Month
- Alert: Low stock warnings
- Alert: Tax payment due dates

### 2. Profit & Loss Statement
**Multi-period comparison table:**
```
CATEGORY            | CURRENT MONTH | LAST MONTH | YTD 2026 | YTD 2025 | % CHANGE
--------------------|---------------|------------|----------|----------|----------
Revenue             | $12,450       | $8,230     | $45,680  | $12,300  | +271%
COGS               | -$4,200       | -$2,890    | -$15,230 | -$4,100  | +271%
Gross Profit        | $8,250        | $5,340     | $30,450  | $8,200   | +271%
Shipping           | -$420         | -$310      | -$1,450  | -$380    | +282%
Payment Fees       | -$548         | -$362      | -$2,010  | -$542    | +271%
Operating Expenses | -$1,200       | -$950      | -$4,100  | -$1,800  | +128%
Net Profit (Pre-Tax)| $6,082        | $3,718     | $22,890  | $5,478   | +318%
Taxes (30%)        | -$1,825       | -$1,115    | -$6,867  | -$1,643  | +318%
Your Net Profit    | $4,257        | $2,603     | $16,023  | $3,835   | +318%
```

### 3. Revenue Breakdown
**Charts + Tables:**
- Revenue by Product (pie chart)
- Revenue Trend (line chart: last 12 months)
- Revenue by Payment Method (bar chart)
- Daily Revenue (calendar heatmap)
- New vs Repeat Customer Revenue

### 4. Product Performance
**Sortable table:**
```
PRODUCT      | UNITS | REVENUE | COGS   | MARGIN | MARGIN % | % OF TOTAL
-------------|-------|---------|--------|--------|----------|------------
Retatrutide  | 45    | $3,060  | $891   | $2,169 | 71%      | 24.6%
Tirzepatide  | 38    | $2,356  | $654   | $1,702 | 72%      | 18.9%
NAD+ 1000mg  | 32    | $2,176  | $576   | $1,600 | 74%      | 17.5%
```

### 5. Customer Analytics
- Customer Cohort Analysis (retention by signup month)
- Repeat Purchase Rate
- Time Between Orders (avg days)
- Customer LTV Distribution
- CAC Trend (last 12 months)

### 6. Inventory Management
- Current Stock Levels
- Reorder Points (alert when < 20 vials)
- Days Until Stock-Out (projected)
- Batch History (all purchases + testing)
- Dead Stock Report

### 7. Tax Dashboard
**Quarterly view:**
```
QUARTER | TAXABLE INCOME | FEDERAL (22%) | STATE (9.3%) | SELF-EMP (14.1%) | TOTAL DUE | PAID   | BALANCE
--------|----------------|---------------|--------------|------------------|-----------|--------|--------
Q1 2026 | $8,500         | $1,870        | $791         | $1,199           | $3,860    | $3,860 | $0
Q2 2026 | $18,200        | $4,004        | $1,693       | $2,566           | $8,263    | $0     | $8,263
Q3 2026 | --             | --            | --           | --               | --        | --     | --
Q4 2026 | --             | --            | --           | --               | --        | --     | --
```

**Payment due dates with alerts:**
- Q1: April 15, 2026
- Q2: June 16, 2026
- Q3: September 15, 2026
- Q4: January 15, 2027

### 8. Cash Flow Statement
```
MONTH    | CASH IN | CASH OUT | NET FLOW | ENDING BALANCE
---------|---------|----------|----------|----------------
Jan 2026 | $3,200  | -$6,800  | -$3,600  | $6,400
Feb 2026 | $5,100  | -$4,200  | $900     | $7,300
Mar 2026 | $8,400  | -$5,100  | $3,300   | $10,600
Apr 2026 | $12,450 | -$6,368  | $6,082   | $16,682
```

---

## Advanced Features (Phase 2-3)

### Forecasting:
- Revenue Forecast (based on trailing 3/6/12 months)
- Inventory Forecast (when to reorder)
- Cash Flow Forecast (projected 3 months ahead)
- Break-Even Analysis (monthly fixed costs ÷ margin %)

### Benchmarking:
- Your Metrics vs Industry Averages
- Your Growth vs Competitors (if data available)
- Goal Tracking ($100k/month target with progress bar)

### Alerts & Notifications:
- Low Stock Alert (< 20 vials of hero products)
- High Refund Rate (>5% in a month)
- Negative Cash Flow
- Tax Payment Due (7 days before deadline)
- Gateway Minimum Not Met ($50 shortfall)
- Unusual Spike/Drop in Daily Revenue (>30% variance)

### Export & Reporting:
- Export to CSV (any table, any period)
- PDF Report Generation (for accountant)
- QuickBooks/Xero Integration (future)
- Shopify/WooCommerce Sync (if you migrate)

### Data Filters:
- Clean Books Mode (hide Zelle/Cash revenue)
- Payment Method Filter (show only CC, or only Zelle)
- Product Category Filter (GLP-1s only, repair peptides only)
- Date Range Picker (custom start/end)
- Customer Segment Filter (new vs repeat)

---

## Technical Implementation

### Data Sources:
1. **Orders Sheet** (Google Sheets Column A-Z)
2. **Batches Sheet** (inventory tracking)
3. **Expenses Sheet** (operating costs)
4. **Quarterly Taxes Sheet** (payment tracking)

### Calculations:
- Real-time aggregation (no caching)
- Client-side calculation (JavaScript)
- Sheet formulas for complex metrics
- localStorage for user preferences (tax rate, Clean Books mode, etc.)

### Performance:
- Lazy load charts (only render when tab active)
- Virtualized tables for >1000 rows
- Memoized calculations
- Responsive design (mobile-first)

---

## Metrics Hierarchy (What Matters Most at Each Stage)

### Pre-Launch → $5k/month:
1. Revenue (any is good)
2. COGS % (keep under 40%)
3. Customer Acquisition (how many new buyers)
4. Stock-outs (NEVER run out of Reta/Tirz)

### $5k → $15k/month:
1. Net Margin % (target 30%+)
2. Repeat Customer Rate (target 40%+)
3. AOV (increase to $150+)
4. CAC (drive down with organic/SEO)

### $15k → $50k/month:
1. LTV:CAC Ratio (target 3:1)
2. Inventory Turnover (optimize cash tied up in stock)
3. Operating Leverage (margin % should increase as revenue grows)
4. Cash Flow (ensure you can fund growth)

### $50k → $100k/month:
1. Operating Margin (target 40%+)
2. Scalability (can you handle 3x volume without hiring?)
3. Customer Retention (keep existing customers, not just acquire new)
4. Product Mix (80% from hero products, 20% from kits)

---

## Dashboard KPIs Summary

**Must Track Daily:**
- Revenue
- Orders
- AOV
- Stock levels (hero products)

**Must Track Weekly:**
- New customers
- Repeat rate
- Top products
- Refund rate

**Must Track Monthly:**
- P&L (full statement)
- Cash flow
- Tax accrual
- Customer LTV

**Must Track Quarterly:**
- YoY growth
- Product performance trends
- Tax payments
- Strategic pivots

---

## Build Timeline

### Phase 1 (This Week): Foundation
- ✅ Remove Jessie split
- ✅ Add YTD tracking
- Add Last Month comparison
- Add Revenue by Product

### Phase 2 (Week 2): Core Analytics
- Multi-period P&L comparison
- Revenue trend chart (last 12 months)
- Product performance table
- Customer metrics (new vs repeat)

### Phase 3 (Week 3): Advanced Features
- Month/Year selector
- YoY comparison view
- Tax dashboard with quarterly tracking
- Inventory forecasting

### Phase 4 (Week 4): Polish
- Charts (line, bar, pie)
- Export to CSV
- Mobile optimization
- Alert system

---

**This is your $0 → $100k dashboard blueprint.**  
**Ready to build Phase 2 now?**
