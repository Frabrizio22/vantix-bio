const QRCode = require('qrcode');

const batchId = 'VX-RETA20-003';
const verifyUrl = `https://vantixbio.com/verify.html?batch=${batchId}`;

QRCode.toFile('VX-RETA20-003-qr.png', verifyUrl, {
  width: 512,
  margin: 2,
  color: {
    dark: '#0F1B2D',
    light: '#FFFFFF'
  }
}, function (err) {
  if (err) throw err;
  console.log('QR code saved to VX-RETA20-003-qr.png');
});
