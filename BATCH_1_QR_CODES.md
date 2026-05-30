# Batch 1 QR Codes - Ready for Vial Labels

All QR codes point to: `https://vantixbio.com/verify.html?batch=VX-XXXXX-001`

When scanned, the verification portal will:
1. Pre-fill the batch number (e.g., "VX-RETA20-001")
2. Show product name in autocomplete
3. User taps "Verify" to see full COA

---

## QR Code URLs for Each Product

### Retatrutide 20mg
**Batch ID:** VX-RETA20-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-RETA20-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-RETA20-001

---

### Semaglutide 10mg
**Batch ID:** VX-SEMA10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-SEMA10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-SEMA10-001

---

### BPC-157 10mg
**Batch ID:** VX-BPC10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-BPC10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-BPC10-001

---

### TB-500 10mg
**Batch ID:** VX-TB10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-TB10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-TB10-001

---

### CJC-1295 10mg
**Batch ID:** VX-CJC10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-CJC10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-CJC10-001

---

### Ipamorelin 5mg
**Batch ID:** VX-IPA5-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-IPA5-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-IPA5-001

---

### MOTS-c 10mg
**Batch ID:** VX-MOTS10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-MOTS10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-MOTS10-001

---

### NAD+ 1000mg
**Batch ID:** VX-NAD1K-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-NAD1K-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-NAD1K-001

---

### GHK-Cu 100mg
**Batch ID:** VX-GHK100-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-GHK100-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-GHK100-001

---

### Tesamorelin 10mg
**Batch ID:** VX-TESA10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-TESA10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-TESA10-001

---

### AOD-9604 10mg
**Batch ID:** VX-AOD10-001  
**QR URL:** `https://vantixbio.com/verify.html?batch=VX-AOD10-001`  
**QR Code:** https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://vantixbio.com/verify.html?batch=VX-AOD10-001

---

## How to Use QR Codes

### For printing on vial labels:
1. Open the QR Code URL in browser (300x300px image)
2. Right-click → Save Image
3. Import into your label design software
4. Print at minimum 0.5" × 0.5" size (larger is better for phone cameras)

### For testing:
- Scan any QR code with phone camera
- Should open: `vantixbio.com/verify.html?batch=VX-XXXXX-001`
- Batch ID pre-fills, product name shows in autocomplete
- Tap "Verify" to see results

---

## When Janoshik COAs Arrive

Update verify.html batch data:
```javascript
'VX-SEMA10-001':{
  name:'Semaglutide 10mg',
  purity:'99.X%',              // Real purity from Janoshik
  content:'XX.XXmg',           // Real content from Janoshik
  endotoxin:'X.XXX EU/vial',   // Real endotoxin from Janoshik
  taskId:'XXXXXX',             // Real Janoshik task ID
  verifyKey:'XXXXXXXXXXXX',    // Real Janoshik verify key
  tested:'June X, 2026'        // Actual test date
}
```

QR codes don't need to change - they just point to the batch ID, and the portal pulls the latest data.

---

**Status:** All 11 Batch 1 products ready for QR code generation and vial labeling.
