// coa-block.js - renders the "Batch Verification" block on product pages from batches.js.
// Usage on a product page:
//   <div class="coa" id="coa-block" data-product="bpc-157"> ...static fallback... </div>
//   <script src="/batches.js?v=1"></script><script src="/coa-block.js?v=1"></script>
// The block only shows what the batch record supports. Nothing is typed into the page by hand.
(function () {
  var host = document.getElementById('coa-block');
  if (!host || typeof batches === 'undefined' || typeof currentBatch === 'undefined') return;

  var slug = host.getAttribute('data-product');
  var id = currentBatch[slug];
  var rec = id ? resolveBatch(id) : null;
  if (!id || !rec) return; // keep the static fallback

  function text(html) {
    return new DOMParser().parseFromString(String(html), 'text/html').documentElement.textContent;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shortDate(d) {
    return String(d || '').replace(/^(\w{3})\w*\s/, '$1 ');
  }

  var tests = rec.tests || [];
  var hasResults = tests.length > 0;
  var tiles = [];

  if (hasResults) {
    var isHplc = tests.some(function (t) {
      return (t.rows || []).some(function (r) { return r.key === 'Method' && /HPLC/i.test(r.value); });
    });
    if (!isNaN(parseFloat(rec.purity))) {
      tiles.push([isHplc ? 'Purity (HPLC)' : 'Purity', rec.purity + '%']);
    } else if (rec.content) {
      tiles.push(['Content (quantitative)', rec.content + ' ' + (rec.contentUnit || '')]);
    }
    if (rec.endotoxin && /^\s*[<≤]?\s*\d/.test(rec.endotoxin)) {
      tiles.push(['Endotoxin', rec.endotoxin + (rec.endotoxinUnit ? ' ' + rec.endotoxinUnit : '')]);
    } else if (rec.endotoxin === 'Pass' && /Microbials/i.test(rec.endotoxinSpec || '')) {
      tiles.push(['Microbials · Metals · Solvents', 'Pass']);
    }
  }
  tiles.push(['Batch ID', id]);
  if (hasResults && rec.tested) tiles.push(['Tested', shortDate(rec.tested)]);

  var grid = tiles.map(function (t) {
    return '<div class="coa-metric"><div class="coa-metric-label">' + esc(t[0]) +
      '</div><div class="coa-metric-value">' + esc(t[1]) + '</div></div>';
  }).join('');

  var check = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:18px;height:18px;stroke:var(--signal)"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>';
  var note;

  if (hasResults) {
    var urls = tests.map(function (t) { return t.verifyUrl || ''; }).join(' ');
    var labs = [];
    if (/phsolutionslab/i.test(urls)) labs.push('PH Solutions Lab');
    if (/janoshik/i.test(urls)) labs.push('Janoshik');
    var titles = [];
    tests.forEach(function (t) {
      var title = text(t.title || '');
      if (title && titles.indexOf(title) < 0) titles.push(title);
    });
    note = '<strong>Independently verified' + (labs.length ? ' by ' + esc(labs.join(' and ')) : '') + ':</strong> ' +
      esc(titles.join(' + ')) + ' — <a href="../verify.html?product=' + encodeURIComponent(slug) +
      '" style="color:var(--accent);text-decoration:underline">View COA</a>';
  } else {
    note = '<strong>COA being added:</strong> results for this batch will be published on the verify page.';
  }

  host.innerHTML = '<h2>Batch Verification</h2><div class="coa-grid">' + grid + '</div>' +
    '<div class="coa-note">' + check + '<span>' + note + '</span></div>';
})();
