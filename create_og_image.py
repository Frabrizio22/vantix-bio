#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create 1200x630 canvas
width, height = 1200, 630
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Create gradient background (approximate - PIL doesn't do gradients natively)
# Use layered rectangles for gradient effect
for y in range(height):
    # Interpolate between dark navy (#0F172A) and blue (#2C4F7F)
    ratio = y / height
    r = int(15 + (44 - 15) * ratio)
    g = int(23 + (79 - 23) * ratio)
    b = int(42 + (127 - 42) * ratio)
    draw.rectangle([(0, y), (width, y+1)], fill=(r, g, b))

# Load and resize logo (maintain aspect ratio)
logo_path = '/Users/frabrizio/.openclaw/workspace/vantix/logo.png'
if os.path.exists(logo_path):
    logo = Image.open(logo_path)
    # Resize to 400px width, maintain aspect ratio
    logo_width = 400
    aspect = logo.height / logo.width
    logo_height = int(logo_width * aspect)
    logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    
    # Center logo horizontally, position at y=140
    logo_x = (width - logo_width) // 2
    logo_y = 140
    
    # Paste logo (handle transparency if PNG)
    if logo.mode == 'RGBA':
        img.paste(logo, (logo_x, logo_y), logo)
    else:
        img.paste(logo, (logo_x, logo_y))
    
    # Add text below logo
    text_y = logo_y + logo_height + 70
else:
    # If logo not found, just add text centered
    text_y = height // 2

# Add tagline text
try:
    # Try to use system font (Helvetica/Arial)
    font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 36)
except:
    font = ImageFont.load_default()

text = "Janoshik-Verified • Forensic-Grade Research Peptides"
# Get text bbox for centering
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_x = (width - text_width) // 2

# Draw text with slight shadow effect
shadow_offset = 2
draw.text((text_x + shadow_offset, text_y + shadow_offset), text, fill=(0, 0, 0, 128), font=font)
draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)

# Save as JPEG
output_path = '/Users/frabrizio/.openclaw/workspace/vantix/og-image-new.jpg'
img.save(output_path, 'JPEG', quality=95)
print(f"Saved to {output_path}")
