#!/bin/bash

# This script applies July 4th sale updates to shop.html

FILE="shop.html"
BACKUP="shop_pre_july4_backup.html"

# Backup original
cp "$FILE" "$BACKUP"

# Insert sale CSS before </style>
sed -i.tmp '/@media(min-width:768px){.toast-notification{max-width:480px}}/a\
\
/* July 4th Sale Styles */\
.sale-banner{background:linear-gradient(135deg,#DC2626 0%,#991b1b 100%);color:#fff;padding:14px 20px;text-align:center;font-family:'\''JetBrains Mono'\'',monospace;font-size:12px;font-weight:600;letter-spacing:.08em;border-bottom:2px solid #7f1d1d;position:sticky;top:37px;z-index:99}\
.sale-banner a{color:#fef3c7;text-decoration:underline;margin-left:8px}\
.sale-popup{position:fixed;inset:0;background:rgba(10,22,40,.9);z-index:10000;display:none;align-items:center;justify-content:center;padding:20px}\
.sale-popup.active{display:flex}\
.sale-popup-content{background:#0A1628;border:2px solid #DC2626;border-radius:16px;padding:40px 32px;max-width:520px;width:100%;position:relative;text-align:center;box-shadow:0 20px 60px rgba(220,38,38,.4)}\
.sale-popup-close{position:absolute;top:16px;right:16px;background:#fff;border:none;padding:8px;cursor:pointer;border-radius:50%;opacity:.9}\
.sale-popup-close:hover{opacity:1}\
.sale-popup-close svg{width:18px;height:18px}\
.sale-popup h2{font-size:42px;color:#DC2626;margin-bottom:8px;font-weight:900;letter-spacing:-1px}\
.sale-popup h3{font-size:24px;color:#60A5FA;margin-bottom:20px;font-weight:700}\
.sale-popup p{color:rgba(255,255,255,.85);font-size:15px;line-height:1.7;margin-bottom:20px}\
.sale-popup .cta{background:#DC2626;color:#fff;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;margin-top:12px;transition:background .3s}\
.sale-popup .cta:hover{background:#991b1b}\
.sale-price{display:flex;align-items:center;gap:10px}\
.original-price{text-decoration:line-through;opacity:.5;font-size:20px}\
.sale-badge{background:#DC2626;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;letter-spacing:.05em;text-transform:uppercase}\
@media(max-width:640px){.sale-banner{font-size:11px;padding:12px}.sale-popup h2{font-size:32px}.sale-popup h3{font-size:20px}.sale-popup-content{padding:32px 24px}}
' "$FILE"

rm "$FILE.tmp"

echo "✅ July 4th sale CSS added"
echo "✅ Backup saved to $BACKUP"
echo "⚠️  Manual steps required:"
echo "   1. Add sale banner HTML after status bar"
echo "   2. Update renderProducts() function for sale pricing"  
echo "   3. Add sale popup logic before </script>"
