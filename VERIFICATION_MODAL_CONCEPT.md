# PDF Modal Viewer for verify.html

## What To Add

### 1. Add PDF Modal HTML (before closing </body>)

```html
<!-- PDF Modal -->
<div id="coaModal" class="coa-modal">
  <div class="coa-modal-content">
    <div class="coa-modal-header">
      <div>
        <div class="modal-logo">VANTIX BIO</div>
        <div class="modal-batch" id="modalBatchId"></div>
      </div>
      <button class="modal-close" onclick="closeCoaModal()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <div class="coa-modal-body">
      <iframe id="coaIframe" src="" frameborder="0"></iframe>
    </div>
    
    <div class="coa-modal-footer">
      <a href="#" id="downloadCoaBtn" class="btn btn-dark" download>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;margin-right:8px">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
        </svg>
        Download PDF
      </a>
      <a href="#" id="modalJanoshikLink" class="btn btn-outline" target="_blank" rel="noopener">
        Verify on Janoshik.com →
      </a>
    </div>
  </div>
</div>
```

### 2. Add CSS for Modal

```css
.coa-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.95);
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.coa-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.coa-modal-content {
  background: #FAFAF7;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.coa-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E5E5E0;
}

.modal-logo {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #143054;
}

.modal-batch {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: rgba(10,22,40,0.6);
  margin-top: 4px;
}

.modal-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #0A1628;
  border-radius: 8px;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(0,0,0,0.05);
}

.modal-close svg {
  width: 24px;
  height: 24px;
}

.coa-modal-body {
  flex: 1;
  padding: 24px;
  overflow: hidden;
}

.coa-modal-body iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid #E5E5E0;
}

.coa-modal-footer {
  padding: 24px;
  border-top: 1px solid #E5E5E0;
  display: flex;
  gap: 12px;
}

.coa-modal-footer .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 3. Add JavaScript Functions

```javascript
let currentBatchId = '';
let currentTaskId = '';

// Update showResults() to store batch info
function showResults(input, batch) {
  currentBatchId = input;
  currentTaskId = batch.taskId;
  
  document.getElementById('productName').textContent = batch.name;
  document.getElementById('batchId').textContent = 'Batch ID: ' + input;
  document.getElementById('purity').textContent = batch.purity;
  document.getElementById('taskId').textContent = batch.taskId;
  document.getElementById('janoshikLink').href = 'https://janoshik.com/tests/' + batch.taskId;
  document.getElementById('resultCard').classList.add('active');
  document.getElementById('resultCard').scrollIntoView({behavior:'smooth',block:'start'});
  animateChromatogram(batch.purity);
}

// Add modal functions
function openCoaModal() {
  const modal = document.getElementById('coaModal');
  const iframe = document.getElementById('coaIframe');
  const downloadBtn = document.getElementById('downloadCoaBtn');
  const janoshikLink = document.getElementById('modalJanoshikLink');
  const modalBatchId = document.getElementById('modalBatchId');
  
  // Set batch ID in modal header
  modalBatchId.textContent = currentBatchId;
  
  // Set PDF source (replace with your actual PDF path)
  const pdfPath = '/coa/' + currentBatchId + '.pdf';
  iframe.src = pdfPath;
  
  // Set download link
  downloadBtn.href = pdfPath;
  downloadBtn.download = currentBatchId + '_Janoshik_COA.pdf';
  
  // Set Janoshik link
  janoshikLink.href = 'https://janoshik.com/tests/' + currentTaskId;
  
  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCoaModal() {
  const modal = document.getElementById('coaModal');
  const iframe = document.getElementById('coaIframe');
  
  modal.classList.remove('active');
  iframe.src = '';
  document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCoaModal();
  }
});

// Close modal on background click
document.getElementById('coaModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeCoaModal();
  }
});
```

### 4. Update "View Full COA" Button

In your result card CTA grid, update the button:

```html
<button class="btn btn-dark" onclick="openCoaModal()">View Full COA</button>
```

---

## What This Gives You

✅ **Clean modal viewer** (branded, professional)  
✅ **Batch ID visible** (reminds user what they're viewing)  
✅ **Download button** (lets them save PDF)  
✅ **Janoshik link** (transparency, verification)  
✅ **Escape to close** (good UX)  
✅ **Mobile-responsive** (works on phone)  

---

## Alternative: Google Docs Viewer (If PDFs Are Hosted)

If you don't want to build an iframe viewer, use Google's:

```javascript
function openCoaModal() {
  const pdfUrl = 'https://vantixbio.com/coa/' + currentBatchId + '.pdf';
  const viewerUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfUrl) + '&embedded=true';
  document.getElementById('coaIframe').src = viewerUrl;
  // ... rest of modal code
}
```

Pros:
- Works on mobile (better than native PDF viewer)
- No download/print buttons (if you want to restrict)
- Reliable rendering

Cons:
- Requires Google service
- Slightly slower load
