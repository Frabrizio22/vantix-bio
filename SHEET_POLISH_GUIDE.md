# Vantix Sheet - Final Polish Guide
**5-Minute Setup in Google Sheets**

Open sheet: https://docs.google.com/spreadsheets/d/1n1YnFDUHyufWPXLAFOxz6RNkPGLr6gajG8JVc00cxTs/edit

---

## 1. ORDERS TAB (2 min)

### Add Dropdowns:
1. Select column **L** (Payment) - click column header
2. **Data** → **Data validation**
3. Criteria: **List of items**
4. Enter: `Zelle,Credit Card,Bitcoin`
5. Click **Save**

6. Select column **T** (Status)
7. **Data** → **Data validation**
8. List of items: `Pending,Processing,Shipped,Delivered,Cancelled`
9. Click **Save**

### Add Colors (Status):
1. Select column **T** (Status)
2. **Format** → **Conditional formatting**
3. **Format cells if...** → **Text is exactly** → `Shipped`
4. Formatting style: **Green background**
5. Click **Done**
6. Click **+ Add another rule**
7. Text is exactly `Delivered` → Green background
8. Add another: `Pending` → Yellow background
9. Add another: `Processing` → Light blue background
10. Add another: `Cancelled` → Red background

### Freeze Header:
1. Click cell **A2**
2. **View** → **Freeze** → **1 row**

---

## 2. PRODUCTS TAB (2 min)

### Add Dropdowns:
1. Column **G** (Status): `in_stock,out_of_stock,pre_order`
2. Column **H** (Category): `GLP-1,Recovery,Growth Hormone,Longevity,Fat Loss`

### Add Colors (Status):
1. Select column **G**
2. Conditional formatting:
   - `in_stock` → Green
   - `out_of_stock` → Red
   - `pre_order` → Yellow

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## 3. BATCHES TAB (1 min)

### Add Dropdowns:
1. Column **D** (Supplier): `Dora,Bane,Other`
2. Column **M** (Status): `Active,Depleted,Testing`

### Add Colors (Status):
1. Column **M**:
   - `Active` → Green
   - `Depleted` → Gray
   - `Testing` → Yellow

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## 4. EXPENSES TAB (1 min)

### Add Dropdowns:
1. Column **B** (Category): `Product Purchase,Testing,Packaging,Shipping,Marketing,Profit Split,Other`
2. Column **G** (Payment Method): `Wire Transfer,Credit Card,PayPal,Zelle,Cash`

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## 5. NEWSLETTER TAB (30 sec)

### Add Dropdowns:
1. Column **C** (Source): `website,checkout,referral,import`
2. Column **D** (Status): `active,unsubscribed,bounced`

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## 6. NOTIFICATIONS TAB (30 sec)

### Add Dropdown:
1. Column **D** (Status): `pending,sent,delivered,failed`

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## 7. DASHBOARD TAB (30 sec)

### Freeze Header:
1. **View** → **Freeze** → **1 row**

---

## OPTIONAL (But Recommended):

### Format Currency Columns:
**Orders Tab:**
- Select columns M, N, O, P, Q, R, S
- **Format** → **Number** → **Currency** → **$**

**Products Tab:**
- Select columns C, D, L, N
- Format as Currency

**Batches Tab:**
- Select columns E, F, G, H, I
- Format as Currency

### Format Percentage:
**Products Tab:**
- Select column K (Margin %)
- **Format** → **Number** → **Percent**

### Format Dates:
**Orders Tab:**
- Select column B (Timestamp)
- **Format** → **Number** → **Date time**

---

## DONE! ✅

Your sheet now has:
- ✅ Dropdown menus for all selection fields
- ✅ Color-coded status columns
- ✅ Frozen headers
- ✅ Professional formatting

**Time: ~7 minutes total**

Next step: Deploy Apps Script automation
