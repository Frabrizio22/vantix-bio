# EXPENSE TRACKING SYSTEM
## Complete Financial Management for Vantix Bio

This system tracks all costs, calculates real profit per order, and generates tax-ready reports.

---

## SETUP (15 minutes)

### Part 1: Add Tabs to Your Google Sheet

Add these new tabs to your Vantix Bio sheet:

1. **Expenses** - All business costs
2. **COGS** - Cost of Goods Sold tracking
3. **Profit Analysis** - Per-order profitability
4. **Monthly Summary** - Tax-ready P&L

---

### Part 2: EXPENSES TAB SETUP

**Column Headers (Row 1):**
```
Date | Category | Description | Amount | Payment Method | Receipt | Notes
```

**Categories (Data Validation for Column B):**
- Product Costs
- Testing (Janoshik)
- Shipping Supplies
- Software/Tools
- Marketing
- Fees (Merchant/Platform)
- Office/Supplies
- Professional Services
- Other

**Formulas:**

Cell H1: `Total Expenses`
Cell H2: `=SUM(D:D)`

Cell I1: `This Month`
Cell I2: `=SUMIFS(D:D, A:A, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))`

---

### Part 3: COGS TAB SETUP

**Column Headers (Row 1):**
```
Product | Supplier Cost | Testing Cost | Total COGS | Units per Batch | COGS per Unit | Last Updated
```

**Pre-fill with your products:**

| Product | Supplier | Testing | Total | Units | Per Unit |
|---------|----------|---------|-------|-------|----------|
| Tirzepatide 30mg | $420 | $440 | $860 | 49 | $17.55 |
| Retatrutide 20mg | $550 | $440 | $990 | 49 | $20.20 |
| Semaglutide 10mg | $200 | $440 | $640 | 49 | $13.06 |
| BPC-157 10mg | $225 | $320 | $545 | 49 | $11.12 |
| TB-500 10mg | $570 | $320 | $890 | 49 | $18.16 |
| MOTS-c 10mg | $270 | $520 | $790 | 49 | $16.12 |
| NAD+ 1000mg | $500 | $400 | $900 | 49 | $18.37 |
| GHK-Cu 100mg | $170 | $380 | $550 | 49 | $11.22 |
| CJC-1295 5mg | $650 | $320 | $970 | 49 | $19.80 |
| Ipamorelin 5mg | $170 | $320 | $490 | 49 | $10.00 |
| Tesamorelin 10mg | $675 | $345 | $1,020 | 49 | $20.82 |
| AOD-9604 10mg | $725 | $320 | $1,045 | 49 | $21.33 |

---

### Part 4: PROFIT ANALYSIS TAB SETUP

This auto-calculates profit for each order.

**Column Headers (Row 1):**
```
Order Number | Date | Total Revenue | COGS | Shipping Cost | Payment Fees | Discount Given | Net Profit | Margin %
```

**Formulas (Row 2, then drag down):**

**Column C (Total Revenue):**
```
=VLOOKUP(A2,Orders!A:N,14,FALSE)
```

**Column D (COGS):**
This requires looking up products and summing their costs. Use Apps Script or manual entry.

**Column E (Shipping Cost):**
```
=VLOOKUP(A2,Orders!A:N,13,FALSE)
```

**Column F (Payment Fees):**
```
=IF(VLOOKUP(A2,Orders!A:N,15,FALSE)="zelle",0,C2*0.05)
```

**Column G (Discount Given):**
```
=VLOOKUP(A2,Orders!A:N,12,FALSE)
```

**Column H (Net Profit):**
```
=C2-D2-E2-F2-G2
```

**Column I (Margin %):**
```
=IF(C2>0,H2/C2*100,0)
```

---

### Part 5: MONTHLY SUMMARY TAB SETUP

Tax-ready P&L statement.

**Structure:**

```
VANTIX BIO - PROFIT & LOSS STATEMENT
Month: [Dropdown: All Time, Jan 2026, Feb 2026, etc.]

REVENUE
Total Sales:                 =SUM(Orders!N:N)
Less: Discounts:             =SUM(Orders!L:L)
Net Revenue:                 =[Total Sales - Discounts]

COST OF GOODS SOLD
Product Costs:               =SUMIF(Expenses!B:B,"Product Costs",Expenses!D:D)
Testing Costs:               =SUMIF(Expenses!B:B,"Testing (Janoshik)",Expenses!D:D)
Total COGS:                  =[Product + Testing]

GROSS PROFIT:                =[Net Revenue - Total COGS]
Gross Margin %:              =[Gross Profit / Net Revenue * 100]

OPERATING EXPENSES
Shipping Supplies:           =SUMIF(Expenses!B:B,"Shipping Supplies",Expenses!D:D)
Software/Tools:              =SUMIF(Expenses!B:B,"Software/Tools",Expenses!D:D)
Marketing:                   =SUMIF(Expenses!B:B,"Marketing",Expenses!D:D)
Merchant Fees:               =SUMIF(Expenses!B:B,"Fees*",Expenses!D:D)
Other:                       =SUMIF(Expenses!B:B,"Other",Expenses!D:D)
Total Operating Expenses:    =[Sum all above]

NET PROFIT:                  =[Gross Profit - Operating Expenses]
Net Margin %:                =[Net Profit / Net Revenue * 100]

TAX LIABILITY (30%):         =[Net Profit * 0.30]
AFTER-TAX PROFIT:            =[Net Profit - Tax Liability]
```

---

## USAGE

### Daily/Weekly Tasks

**When you receive inventory:**
1. Log to Expenses tab: Category "Product Costs", Amount = invoice total
2. Update COGS tab if supplier prices changed

**When you pay for testing:**
1. Log to Expenses tab: Category "Testing (Janoshik)", Amount = testing invoice
2. COGS tab auto-allocates cost per unit

**When shipping supplies arrive:**
1. Log to Expenses tab: Category "Shipping Supplies"

**Monthly review:**
1. Check Monthly Summary tab
2. Export for accountant/taxes
3. Compare month-over-month growth

---

## AUTOMATION OPTIONS

### Option A: Manual Entry (Simple)
- Log expenses as they happen
- COGS tracked in separate tab
- Profit Analysis calculated with formulas

### Option B: Apps Script Automation (Advanced)
Add this to your Apps Script to auto-calculate COGS:

```javascript
function calculateOrderCOGS(orderNumber) {
  const productsSheet = getSheet('Products');
  const cogsSheet = getSheet('COGS');
  
  const products = productsSheet.getDataRange().getValues();
  const cogsData = cogsSheet.getDataRange().getValues();
  
  let totalCOGS = 0;
  
  // Find all products in this order
  for (let i = 1; i < products.length; i++) {
    if (products[i][0] === orderNumber) {
      const productName = products[i][2];
      const quantity = products[i][4];
      
      // Find COGS for this product
      for (let j = 1; j < cogsData.length; j++) {
        if (cogsData[j][0] === productName) {
          const cogsPerUnit = cogsData[j][5];
          totalCOGS += cogsPerUnit * quantity;
          break;
        }
      }
    }
  }
  
  return totalCOGS;
}
```

---

## REPORTS YOU CAN GENERATE

1. **Profit by Product** - Which items are most profitable?
2. **Profit by Month** - Growth trajectory
3. **Margin Analysis** - Are discounts hurting profitability?
4. **Tax Projections** - Quarterly tax estimates
5. **Cash Flow** - Revenue vs expenses timing

---

## COMBINED PRC + VANTIX VIEW

To see both businesses together:

1. Create new Sheet: "Combined Analytics"
2. Import data from both PRC and Vantix sheets
3. Use IMPORTRANGE() to pull data:

```
=IMPORTRANGE("PRC_SHEET_URL", "Orders!A:N")
=IMPORTRANGE("VANTIX_SHEET_URL", "Orders!A:N")
```

4. Combine in summary table showing:
   - Total revenue (both brands)
   - PRC revenue (Jessie gets 30%)
   - Vantix revenue (100% yours)
   - Combined profit
   - Your actual take-home

---

## TAX-READY EXPORT

At tax time:

1. Go to Monthly Summary tab
2. File → Download → PDF
3. Give to accountant

Contains everything needed:
- Total revenue
- COGS breakdown
- Operating expenses by category
- Net profit
- Estimated tax liability

---

**Questions? The formulas are all in the tab descriptions above. Copy-paste into your sheet.**
