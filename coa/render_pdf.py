#!/usr/bin/env python3
import subprocess
import sys
from PIL import Image

pdf_path = "VBI-BPC10-20260914-01.pdf"

# Use sips to convert each page
subprocess.run([
    "sips", "-s", "format", "png", 
    "--resampleWidth", "3000",
    pdf_path, 
    "--out", "page1.png"
], check=True, capture_output=True)

# For 2-page PDF, we need to split first
subprocess.run(["pdftk", pdf_path, "cat", "1", "output", "page1.pdf"], check=False)
subprocess.run(["pdftk", pdf_path, "cat", "2", "output", "page2.pdf"], check=False)

# Convert both
for i in [1, 2]:
    subprocess.run([
        "sips", "-s", "format", "png",
        "--resampleWidth", "3000", 
        f"page{i}.pdf",
        "--out", f"page{i}.png"
    ], check=False, capture_output=True)

# Combine vertically
try:
    img1 = Image.open("page1.png")
    img2 = Image.open("page2.png")
    
    # Create combined image
    total_height = img1.height + img2.height
    combined = Image.new('RGB', (img1.width, total_height), 'white')
    combined.paste(img1, (0, 0))
    combined.paste(img2, (0, img1.height))
    
    # Save as high quality JPEG
    combined.save("VBI-BPC10-20260914-01.jpg", "JPEG", quality=95, optimize=True)
    print("Success: Created combined image")
except Exception as e:
    print(f"Error: {e}")
