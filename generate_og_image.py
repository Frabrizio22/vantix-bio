#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Image dimensions (standard OG image size)
WIDTH = 1200
HEIGHT = 630

# Colors
WHITE = (255, 255, 255)
DARK_BLUE = (53, 91, 138)  # Exact blue from image 2
TEXT_WHITE = (255, 255, 255)

# Create new image
img = Image.new('RGB', (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Draw top half (white) - already white from background
top_height = HEIGHT // 2

# Draw bottom half (dark blue)
draw.rectangle([(0, top_height), (WIDTH, HEIGHT)], fill=DARK_BLUE)

# Load and resize logo icon only (no text)
try:
    logo_path = '/Users/frabrizio/.openclaw/workspace/vantix/logo-icon.svg'
    # Convert SVG to PNG using cairosvg if available, otherwise skip
    try:
        import cairosvg
        from io import BytesIO
        png_data = cairosvg.svg2png(url=logo_path, output_width=280)
        logo = Image.open(BytesIO(png_data))
    except:
        # Fallback: just center without logo
        print("SVG conversion not available, skipping logo")
        logo = None
    
    if logo:
        # Center logo in top half
        logo_width, logo_height = logo.size
        logo_x = (WIDTH - logo_width) // 2
        logo_y = (top_height - logo_height) // 2
        
        # Paste logo (handle transparency)
        if logo.mode == 'RGBA':
            img.paste(logo, (logo_x, logo_y), logo)
        else:
            img.paste(logo, (logo_x, logo_y))
except Exception as e:
    print(f"Logo error: {e}")

# Add text to bottom half
try:
    # Try to use a bold system font
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 54)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
except:
    # Fallback to default font
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Main tagline
tagline = "Forensic-Grade Peptides — Janoshik Verified"
tagline_bbox = draw.textbbox((0, 0), tagline, font=font_large)
tagline_width = tagline_bbox[2] - tagline_bbox[0]
tagline_x = 80  # Left-aligned with padding

# Calculate vertical center for text in bottom section
text_section_height = HEIGHT - top_height
tagline_y = top_height + (text_section_height // 2) - 35

draw.text((tagline_x, tagline_y), tagline, fill=TEXT_WHITE, font=font_large)

# URL below
url = "vantixbio.com"
url_y = tagline_y + 65
draw.text((tagline_x, url_y), url, fill=(160, 180, 200), font=font_small)

# Save
output_path = '/Users/frabrizio/.openclaw/workspace/vantix/og-image-new.jpg'
img.save(output_path, 'JPEG', quality=95, optimize=True)
print(f"Saved to: {output_path}")
