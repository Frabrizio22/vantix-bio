#!/bin/bash

# List of core articles to rebuild
articles=(
  "how-to-verify-janoshik-coa.html"
  "batch-testing-why-every-batch-matters.html"
  "endotoxin-testing.html"
  "how-to-reconstitute-peptides.html"
  "bpc-157-10mg-pillar.html"
)

for article in "${articles[@]}"; do
  backup="${article%.html}-REBUILD-BACKUP.html"
  
  # Backup current
  cp "$article" "$backup"
  
  echo "Rebuilding $article..."
done

echo "Done - now need to manually extract content from each backup and format"
