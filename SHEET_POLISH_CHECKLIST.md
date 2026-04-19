# Vantix Sheet - Professional Polish Checklist

## Issues Found:
1. ❌ Products tab - columns misaligned, formulas broken
2. ❌ No data validation dropdowns anywhere
3. ❌ No conditional formatting (status colors)
4. ❌ Headers not frozen
5. ❌ No currency/percentage formatting
6. ❌ Example data showing errors
7. ❌ No instructions for users

## Fixes Needed:

### Orders Tab
- [ ] Fix row 2 template formulas
- [ ] Add dropdown: Payment (Zelle, Credit Card, Bitcoin)
- [ ] Add dropdown: Status (Pending, Processing, Shipped, Delivered, Cancelled)
- [ ] Conditional format Status column (Green=Shipped/Delivered, Yellow=Pending/Processing, Red=Cancelled)
- [ ] Format columns: M,N,O (Currency $), P,Q,R,S (Currency $), B (Date/Time)
- [ ] Freeze row 1 (header)
- [ ] Bold + background color for headers
- [ ] Protect formula columns (P, R, S - auto-calculated)

### Products Tab
- [ ] REBUILD - completely misaligned
- [ ] Correct column order: ID, Name, Price, Cost, Starting Stock, Current Stock, Status, Category, COA, Batch, Batch Cost, Margin%, Profit/Unit, Total Sold, Revenue
- [ ] Add dropdown: Status (in_stock, out_of_stock, pre_order)
- [ ] Add dropdown: Category (GLP-1, Recovery, Growth Hormone, Longevity, Fat Loss)
- [ ] Format: C,D,K (Currency $), L (Percent %), M (Currency $), O (Currency $)
- [ ] Conditional format Status (Green=in_stock, Red=out_of_stock, Yellow=pre_order)
- [ ] Protect formula columns (F, L, M, N, O)
- [ ] Freeze row 1

### Batches Tab
- [ ] Add dropdown: Supplier (Dora, Bane, Other)
- [ ] Add dropdown: Status (Active, Depleted, Testing)
- [ ] Format: E,F,G,H,I (Currency $), B (Date)
- [ ] Conditional format Status (Green=Active, Gray=Depleted, Yellow=Testing)
- [ ] Freeze row 1

### Expenses Tab
- [ ] Add dropdown: Category (Product Purchase, Testing, Packaging, Shipping, Marketing, Profit Split, Other)
- [ ] Add dropdown: Payment Method (Wire Transfer, Credit Card, PayPal, Zelle, Cash)
- [ ] Format: E (Currency $), A (Date)
- [ ] Freeze row 1

### Newsletter Tab
- [ ] Add dropdown: Source (website, checkout, referral, import)
- [ ] Add dropdown: Status (active, unsubscribed, bounced)
- [ ] Format: A (Date)
- [ ] Freeze row 1

### Notifications Tab
- [ ] Add dropdown: Status (pending, sent, delivered, failed)
- [ ] Format: A,E (Date)
- [ ] Freeze row 1

### Dashboard Tab
- [ ] Format all numbers: Currency $ or Percent %
- [ ] Add instructions at top
- [ ] Color-code sections (Revenue=Green, Orders=Blue, Profit=Gold)

## Manual Steps (Google Sheets UI):
1. Data Validation (Data → Data validation)
2. Conditional Formatting (Format → Conditional formatting)
3. Number Formatting (Format → Number)
4. Freeze Rows (View → Freeze → 1 row)
5. Protect Ranges (Data → Protected sheets and ranges)
