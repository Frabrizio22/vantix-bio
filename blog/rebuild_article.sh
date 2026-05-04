#!/bin/bash
# Extract article content and wrap with clean template

extract_and_rebuild() {
  local input="$1"
  local output="${input%.html}-NEW.html"
  
  # Extract title
  title=$(grep -m1 "<title>" "$input" | sed 's/.*<title>\(.*\)<\/title>.*/\1/' | sed 's/ |.*//' | sed 's/:.*//')
  
  # Extract main article content between <article> or <main> tags
  # Strip old header/footer, keep only content
  awk '/<article class="article">/{flag=1;next} /<\/article>/{flag=0} flag' "$input" > /tmp/article_content.html
  
  # If no article tag, try main tag
  if [ ! -s /tmp/article_content.html ]; then
    awk '/<main class="article-container">/{flag=1;next} /<\/main>/{flag=0} flag' "$input" > /tmp/article_content.html
  fi
  
  # Build new file with clean template
  cat > "$output" << TEMPLATE
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Vantix Bio</title>
<link rel="icon" type="image/png" href="../favicon.png">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-BBBNSQT84M"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-BBBNSQT84M');</script>
<link rel="stylesheet" href="blog.css">
</head>
<body>

<div class="status-bar"><div class="status-inner">Janoshik Verified</div></div>

<div class="header">
<div class="header-inner">
<button class="back-btn" onclick="window.location.href='index.html'">
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/></svg>
<span>Back</span>
</button>
<a href="../index.html" class="logo"><img src="../logo-header.svg" alt="Vantix Bio"></a>
</div>
</div>

<article>
$(cat /tmp/article_content.html)
</article>

<footer>
<div class="footer-content">
<div class="footer-disclaimer">
<p><strong>Research Use Only.</strong> Products are for laboratory research only—not for human consumption, therapeutic use, or diagnosis. Not approved by the FDA for clinical use.</p>
</div>
<div class="footer-legal">
<p>&copy; 2026 Vantix Bio LLC · Research Use Only</p>
</div>
</div>
</footer>

</body>
</html>
TEMPLATE

  echo "Created $output"
}

# Process all 5 core articles
for article in how-to-verify-janoshik-coa.html batch-testing-why-every-batch-matters.html endotoxin-testing.html how-to-reconstitute-peptides.html bpc-157-10mg-pillar.html; do
  extract_and_rebuild "$article"
done

echo "All 5 articles rebuilt. Review -NEW.html files before replacing originals."
