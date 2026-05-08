# Verify.html Update Plan - New UX Flow

## Changes to Make

### 1. Update Terminal Animation Speed
**Current:** 400ms per step = 3.2s total
**New:** 180ms per step = 1.44s total

**File location:** Line ~346
```javascript
// OLD:
},400);

// NEW:
},180);
```

---

### 2. Add New CSS for Redesigned Result Card

**Add after existing .result-card styles (around line 81):**

```css
/* New result card styles */
.verified-section {
  text-align: center;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--hairline);
  margin-bottom: 32px;
}

.verified-badge-new {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(16,185,129,.12);
  border: 1.5px solid rgba(16,185,129,.4);
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .15em;
  color: #10b981;
  margin-bottom: 24px;
}

.verified-badge-new svg {
  width: 20px;
  height: 20px;
}

.product-title {
  font-size: 32px;
  font-weight: 300;
  margin-bottom: 8px;
  color: var(--navy);
}

.batch-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: rgba(10,22,40,0.6);
  margin-bottom: 8px;
}

.verified-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: rgba(10,22,40,0.5);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0;
}

@media(max-width: 640px) {
  .metrics-grid {
    gap: 16px;
  }
}

.metric {
  text-align: center;
}

.metric-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  font-weight: 600;
  color: var(--navy);
  margin-bottom: 8px;
}

@media(max-width: 640px) {
  .metric-value {
    font-size: 22px;
  }
}

.metric-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .2em;
  color: rgba(10,22,40,0.5);
  font-weight: 600;
}

.primary-cta {
  background: var(--navy);
  color: #fff;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all .3s;
  margin-bottom: 32px;
}

.primary-cta:hover {
  background: var(--accent);
  transform: translateY(-2px);
}

.primary-cta svg {
  width: 18px;
  height: 18px;
}

.coa-preview-section {
  background: var(--bg);
  border: 1px solid var(--hairline);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.coa-preview-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .15em;
  color: rgba(10,22,40,0.6);
  margin-bottom: 16px;
}

.coa-thumbnail {
  width: 120px;
  height: 160px;
  background: #fff;
  border: 2px solid var(--hairline);
  border-radius: 8px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(10,22,40,0.3);
  font-family: 'JetBrains Mono', monospace;
  font-size: 48px;
  font-weight: 600;
}

.coa-btn {
  background: transparent;
  border: 1.5px solid var(--navy);
  color: var(--navy);
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all .3s;
}

.coa-btn:hover {
  background: var(--navy);
  color: #fff;
}

.analytical-section {
  border: 1px solid var(--hairline);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.analytical-toggle {
  background: transparent;
  border: none;
  width: 100%;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .15em;
  color: var(--text);
  transition: background .2s;
}

.analytical-toggle:hover {
  background: rgba(0,0,0,0.02);
}

.analytical-toggle svg {
  width: 16px;
  height: 16px;
  transition: transform .3s;
}

.analytical-toggle.active svg {
  transform: rotate(180deg);
}

.analytical-content {
  display: none;
  padding: 24px;
  background: var(--bg);
  border-top: 1px solid var(--hairline);
}

.analytical-content.active {
  display: block;
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--hairline);
  font-size: 14px;
}

.data-row:last-child {
  border-bottom: none;
}

.data-label {
  font-weight: 500;
  color: rgba(10,22,40,0.7);
}

.data-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--navy);
}

.footer-note {
  text-align: center;
  padding: 24px 0 0;
  font-size: 13px;
  color: rgba(10,22,40,0.6);
  line-height: 1.6;
}
```

---

### 3. Replace Result Card HTML

**Find the `<div class="result-card" id="resultCard">` section (around line 190)**
**Replace entire section with:**

```html
<div class="result-card" id="resultCard">
  <!-- Verification Header -->
  <div class="verified-section">
    <div class="verified-badge-new">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
      <span>Verified by Janoshik Analytical</span>
    </div>
    
    <h2 class="product-title" id="productName"></h2>
    <div class="batch-meta" id="batchId"></div>
    <div class="verified-date" id="verifiedDate"></div>
  </div>

  <!-- Key Metrics -->
  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-value" id="purity"></div>
      <div class="metric-label">Purity</div>
    </div>
    <div class="metric">
      <div class="metric-value" id="endotoxin">&lt;0.05 EU/mg</div>
      <div class="metric-label">Endotoxin</div>
    </div>
    <div class="metric">
      <div class="metric-value">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:28px;height:28px;display:inline;color:#10b981">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
        </svg>
      </div>
      <div class="metric-label">LC-MS Identity</div>
    </div>
  </div>

  <!-- Primary CTA -->
  <div style="text-align:center;margin-bottom:32px">
    <a href="#" id="janoshikLink" target="_blank" rel="noopener" class="primary-cta">
      <span>Verify Independently on Janoshik.com</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
      </svg>
    </a>
  </div>

  <!-- COA Preview Section -->
  <div class="coa-preview-section">
    <div class="coa-preview-title">Official Certificate of Analysis</div>
    <div class="coa-thumbnail">📄</div>
    <a href="#" id="coaDownloadLink" target="_blank" class="coa-btn">View Full COA (PDF)</a>
  </div>

  <!-- Analytical Data (Collapsed) -->
  <div class="analytical-section">
    <button class="analytical-toggle" id="analyticalToggle" onclick="toggleAnalytical()">
      <span>▼ Analytical Data</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
      </svg>
    </button>
    <div class="analytical-content" id="analyticalContent">
      <!-- HPLC Chromatogram -->
      <div style="margin-bottom:24px">
        <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:rgba(10,22,40,0.6);margin-bottom:16px">HPLC Chromatogram</div>
        <svg class="chart" id="chromatogram" viewBox="0 0 800 160" style="width:100%;height:160px;background:#fff;border:1px solid var(--hairline);border-radius:8px;padding:16px">
          <line x1="40" y1="130" x2="760" y2="130" stroke="#E5E5E0" stroke-width="1.5"/>
          <line x1="40" y1="20" x2="40" y2="130" stroke="#E5E5E0" stroke-width="1.5"/>
          <text x="400" y="150" text-anchor="middle" font-size="9" fill="rgba(10,22,40,.5)">RETENTION TIME</text>
          <text x="20" y="75" text-anchor="middle" font-size="9" fill="rgba(10,22,40,.5)" transform="rotate(-90 20 75)">ABS</text>
          <path id="peakPath" fill="none" stroke="#3973B0" stroke-width="2"/>
          <circle id="peakDot" r="4" fill="#3973B0"/>
          <text id="purityLabel" font-size="11" font-weight="600" fill="#3973B0" opacity="0"></text>
        </svg>
      </div>

      <!-- Raw Data -->
      <div>
        <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:rgba(10,22,40,0.6);margin-bottom:16px">Test Details</div>
        <div class="data-row">
          <span class="data-label">Method</span>
          <span class="data-value">HPLC-DAD</span>
        </div>
        <div class="data-row">
          <span class="data-label">Identity Confirmation</span>
          <span class="data-value">LC-MS/MS</span>
        </div>
        <div class="data-row">
          <span class="data-label">Endotoxin Test</span>
          <span class="data-value">LAL Assay</span>
        </div>
        <div class="data-row">
          <span class="data-label">Janoshik Task ID</span>
          <span class="data-value" id="taskId"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer Note -->
  <div class="footer-note">
    Need additional verification?<br>
    <a href="mailto:support@vantixbio.com" style="color:var(--accent);text-decoration:none">Contact us</a> or test independently through Janoshik.
  </div>
</div>
```

---

### 4. Update JavaScript Functions

**Replace the `showResults()` function (around line 375):**

```javascript
function showResults(input,batch){
  document.getElementById('productName').textContent=batch.name;
  document.getElementById('batchId').textContent='Batch ID: '+input;
  
  // Add verified date (placeholder - will be real when COAs exist)
  document.getElementById('verifiedDate').textContent='Verified: May 2026';
  
  document.getElementById('purity').textContent=batch.purity;
  document.getElementById('taskId').textContent=batch.taskId;
  document.getElementById('janoshikLink').href='https://janoshik.com/tests/'+batch.taskId;
  
  // COA download link (placeholder - update with real path when PDFs exist)
  document.getElementById('coaDownloadLink').href='/coa/'+input+'.pdf';
  
  document.getElementById('resultCard').classList.add('active');
  document.getElementById('resultCard').scrollIntoView({behavior:'smooth',block:'start'});
  
  // Animate chromatogram (will happen when user expands analytical section)
}
```

**Add new toggle function:**

```javascript
function toggleAnalytical(){
  const content=document.getElementById('analyticalContent');
  const toggle=document.getElementById('analyticalToggle');
  const isActive=content.classList.toggle('active');
  toggle.classList.toggle('active');
  
  if(isActive&&!chromAnimated){
    const purity=document.getElementById('purity').textContent;
    animateChromatogram(purity);
    chromAnimated=true;
  }
}
```

---

## Testing Instructions

1. Deploy updated verify.html
2. Go to https://vantixbio.com/verify
3. Enter batch: `VX-RETA20-002` or `RETA20-002`
4. Should see:
   - 1.5s terminal animation (faster)
   - New card layout with big metrics
   - "Verify on Janoshik.com" as primary CTA
   - COA preview section with placeholder thumbnail
   - Collapsed "Analytical Data" section
   - Click to expand chromatogram

---

## Placeholder Data

For VX-RETA20-002:
- Product: Retatrutide 20mg
- Purity: 99.1%
- Verified: May 2026
- Janoshik Task: J-50289
- COA path: /coa/VX-RETA20-002.pdf (placeholder)
