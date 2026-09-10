# Enterprise Dashboard Build Plan (WooCommerce-Level)

## Research Summary - WooCommerce Analytics Features

### Core Metrics (Performance Indicators)
1. **Total Sales** - Gross Sales – Returns – Coupons + Taxes + Shipping
2. **Net Sales** - Gross Sales – Returns – Coupons  
3. **Orders** - Count of new orders
4. **Average Order Value** - Net Sales / Orders
5. **Products Sold** - Discrete items sold
6. **Returns/Refunds** - Value of refunds
7. **Discounted Orders** - Orders with coupons
8. **Net Discount Amount** - Total coupon discounts
9. **Total Tax** - Order Tax + Shipping Tax
10. **Shipping** - Shipping charges
11. **Gross Sales** - Sale price × quantity (no deductions)

### Date Range Features
- **Presets**: Today, Yesterday, Week to Date, Last Week, Month to Date, Last Month, Quarter to Date, Last Year
- **Comparison**: Previous Period vs Previous Year
- **Custom**: Calendar picker with start/end dates
- **URL Persistence**: Date ranges saved in URL for bookmarking

### Chart Features
- **Interval Options** (based on date range length):
  - 1+ year: day/week/month/quarter/year
  - 90 days-1 year: day/week/month/quarter
  - 1-89 days: day/week/month
  - 1 week-28 days: day/week
  - 1 day: day/hour
- **Chart Types**: Line vs Bar toggle
- **Data Legend**: Toggle visibility of comparison periods
- **Responsive**: Auto-adjust based on date range

### Table Features
- **Column Sorting**: Ascending/descending on any column
- **Toggle Column Visibility**: Hide/show columns (saved per user)
- **CSV Export**: Immediate for <25 rows, background job + email for larger
- **Pagination**: 25/50/100 per page, jump to specific page
- **Search**: Filter within table data
- **Advanced Filters**: Multi-criteria filtering

### Dashboard Sections
1. **Performance** - Summary cards with % change, click to drill down
2. **Charts** - Up to 14 different metrics, customizable
3. **Leaderboards**:
   - Top Customers by Total Spend
   - Top Coupons by Order Count
   - Top Categories by Items Sold
   - Top Products by Items Sold

### Report Types
- **Revenue Report** - Total/Net/Gross sales, refunds, shipping
- **Orders Report** - Order count, AOV, status breakdown
- **Products Report** - Items sold, revenue by product
- **Customers Report** - Customer lifetime value, order history
- **Coupons Report** - Discount usage, order count
- **Taxes Report** - Order tax, shipping tax breakdown
- **Downloads Report** (for digital products)

### Settings
- **Order Status Inclusion**: Which statuses count in reports
- **Custom Statuses**: Handle non-standard order statuses
- **Default Date Range**: Site-wide default

## What We Need to Build

### Phase 1: Core Dashboard (Performance + Charts)
- [ ] Proper metric calculations (Total Sales, Net Sales, Gross Sales)
- [ ] Real date range presets (Today, Yesterday, WTD, MTD, QTD, etc.)
- [ ] Comparison periods (Previous Period vs Previous Year)
- [ ] % change indicators with color coding
- [ ] Responsive interval selection based on date range
- [ ] Line vs Bar chart toggle
- [ ] Click-through to detailed reports

### Phase 2: Advanced Tables
- [ ] Column sorting (ascending/descending)
- [ ] Column visibility toggle (saved to session)
- [ ] Pagination with per-page options
- [ ] CSV export (immediate + background job for large exports)
- [ ] Search within table
- [ ] Advanced filters with multi-criteria

### Phase 3: Reports
- [ ] Revenue Report (breakdown by type)
- [ ] Orders Report (status, payment method, date)
- [ ] Products Report (top sellers, revenue, margins)
- [ ] Customers Report (LTV, repeat rate, cohorts)

### Phase 4: Leaderboards
- [ ] Top Customers
- [ ] Top Products
- [ ] Top Categories (kits vs individual)
- [ ] Payment method breakdown

### Phase 5: Polish
- [ ] Drill-down navigation (click metric → full report)
- [ ] URL persistence (shareable links)
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling

## Technical Approach

### Data Layer
- All calculations server-side in Supabase (PostgreSQL functions)
- Client just renders
- Proper indexes for performance

### UI Framework
- Keep vanilla JS (no build step)
- Modular components
- Chart.js for visualizations
- CSS Grid for responsive layout

### State Management
- URL as source of truth
- Session storage for user preferences
- LocalStorage for column visibility

## Build Order
1. Fix data calculations (proper Gross/Net/Total sales)
2. Build date range picker with all presets
3. Implement comparison logic
4. Build performance indicators with drill-down
5. Create advanced table component
6. Add CSV export
7. Build reports
8. Add leaderboards
9. Polish and test
