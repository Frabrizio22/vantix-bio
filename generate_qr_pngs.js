const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const products = [
  { id: 'VX-BPC10-001', name: 'BPC-157-10mg' },
  { id: 'VX-TB10-001', name: 'TB-500-10mg' },
  { id: 'VX-CJC5-001', name: 'CJC-1295-5mg' },
  { id: 'VX-IPA5-001', name: 'Ipamorelin-5mg' },
  { id: 'VX-MOTS10-001', name: 'MOTS-c-10mg' },
  { id: 'VX-NAD1K-001', name: 'NAD-1000mg' },
  { id: 'VX-GHK100-001', name: 'GHK-Cu-100mg' },
  { id: 'VX-SEMA10-001', name: 'Semaglutide-10mg' },
  { id: 'VX-TIRZ30-001', name: 'Tirzepatide-30mg' },
  { id: 'VX-RETA20-001', name: 'Retatrutide-20mg' }
];

const outputDir = path.join(__dirname, 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function generateQRCodes() {
  for (const product of products) {
    const url = `https://vantixbio.com/verify.html?batch=${product.id}`;
    const filename = path.join(outputDir, `${product.name}.png`);
    
    await QRCode.toFile(filename, url, {
      width: 600,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log(`Generated: ${product.name}.png`);
  }
  console.log('\nAll QR codes generated in qr-codes/ folder');
}

generateQRCodes().catch(console.error);
