// Product name normalization and parsing

function parseProductString(productString) {
  // Parse a product string like "2x Tirz 30mg ($59), 1x BPC 157 10mg ($30)"
  // Returns: [{ name: "Tirzepatide 30mg", quantity: 2, price: 59 }, ...]
  
  const products = [];
  const str = String(productString || '');
  
  // Split by comma for multi-product orders
  const items = str.split(',').map(s => s.trim());
  
  items.forEach(item => {
    // Extract quantity (e.g., "2x", "3x")
    let quantity = 1;
    const qtyMatch = item.match(/(\d+)x\s+/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]);
      item = item.replace(qtyMatch[0], ''); // Remove "2x " from string
    }
    
    // Extract price (e.g., "($59)")
    let price = 0;
    const priceMatch = item.match(/\(\$?([\d.]+)\)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
      item = item.replace(priceMatch[0], '').trim(); // Remove "($59)"
    }
    
    // Normalize product name
    const normalized = normalizeProductName(item);
    
    if (normalized) {
      products.push({
        name: normalized,
        quantity: quantity,
        price: price
      });
    }
  });
  
  return products;
}

function normalizeProductName(name) {
  // Normalize product names to canonical form
  const n = String(name).toLowerCase().trim();
  
  // Tirzepatide
  if (n.includes('tirz') || n.includes('tirzepatide')) {
    return 'Tirzepatide 30mg';
  }
  
  // Retatrutide
  if (n.includes('reta') || n.includes('retatrutide')) {
    return 'Retatrutide 20mg';
  }
  
  // Semaglutide
  if (n.includes('sema') || n.includes('semaglutide')) {
    return 'Semaglutide 10mg';
  }
  
  // BPC-157
  if (n.includes('bpc')) {
    return 'BPC-157 10mg';
  }
  
  // TB-500
  if (n.includes('tb') && n.includes('500')) {
    return 'TB-500 10mg';
  }
  
  // GHK-Cu
  if (n.includes('ghk')) {
    return 'GHK-Cu 100mg';
  }
  
  // MOTS-c
  if (n.includes('mots')) {
    return 'MOTS-c 10mg';
  }
  
  // NAD+
  if (n.includes('nad')) {
    return 'NAD+ 1000mg';
  }
  
  // CJC-1295
  if (n.includes('cjc')) {
    return 'CJC-1295 10mg';
  }
  
  // Ipamorelin
  if (n.includes('ipa') || n.includes('ipamorelin')) {
    return 'Ipamorelin 5mg';
  }
  
  // Tesamorelin
  if (n.includes('tesa') || n.includes('tesamorelin')) {
    return 'Tesamorelin 10mg';
  }
  
  // AOD-9604
  if (n.includes('aod')) {
    return 'AOD-9604 10mg';
  }
  
  // Research Kits
  if (n.includes('next-gen') || (n.includes('tirz') && n.includes('reta') && n.includes('kit'))) {
    return 'Next-Gen Research Kit';
  }
  
  if (n.includes('tissue') && n.includes('repair')) {
    return 'Tissue Repair Kit';
  }
  
  if (n.includes('gh') && n.includes('axis')) {
    return 'GH Axis Kit';
  }
  
  // BAC Water
  if (n.includes('bac') && n.includes('water')) {
    return 'BAC Water 10mL';
  }
  
  // If can't normalize, return cleaned version
  return name.replace(/\(\$[\d.]+\)/g, '').trim() || null;
}

// Example usage:
/*
const examples = [
  "2x Tirz 30mg ($59)",
  "Retatrutide 20mg, GHK-Cu 100mg, MOTS-C 10mg",
  "3x Reta 20mg ($67)",
  "1x Next-Gen Kit (Tirz 30mg + Reta 20mg) ($112)"
];

examples.forEach(ex => {
  console.log('Input:', ex);
  console.log('Parsed:', parseProductString(ex));
  console.log('---');
});
*/
