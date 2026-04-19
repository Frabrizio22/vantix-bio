#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

# Image dimensions (standard OG image size)
WIDTH = 1200
HEIGHT = 630

# Colors
WHITE = (255, 255, 255)
DARK_BLUE = (53, 91, 138)  # Exact blue from reference
TEXT_WHITE = (255, 255, 255)

# Create new image
img = Image.new('RGB', (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Draw top half (white)
top_height = HEIGHT // 2

# Draw bottom half (dark blue)
draw.rectangle([(0, top_height), (WIDTH, HEIGHT)], fill=DARK_BLUE)

# Load full logo and crop to just the icon (top portion)
try:
    logo_full = Image.open('/Users/frabrizio/.openclaw/workspace/vantix/logo.png')
    
    # Crop just the hexagon icon (top portion only, no blue bar or text)
    logo_width, logo_height = logo_full.size
    # Crop to just get the hexagon, not the text or any blue bars
    crop_height = int(logo_height * 0.52)  # Top 52% is just the icon without blue
    logo_icon = logo_full.crop((0, 0, logo_width, crop_height))
    
    # Resize to fit nicely in top half
    icon_display_height = 200
    aspect_ratio = logo_icon.width / logo_icon.height
    icon_display_width = int(icon_display_height * aspect_ratio)
    logo_icon = logo_icon.resize((icon_display_width, icon_display_height), Image.Resampling.LANCZOS)
    
    # Center icon in top half
    icon_x = (WIDTH - icon_display_width) // 2
    icon_y = (top_height - icon_display_height) // 2
    
    # Paste icon
    if logo_icon.mode == 'RGBA':
        img.paste(logo_icon, (icon_x, icon_y), logo_icon)
    else:
        img.paste(logo_icon, (icon_x, icon_y))
except Exception as e:
    print(f"Logo error: {e}")

# Add text to bottom half
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 54)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

# Main tagline
tagline = "Forensic-Grade Peptides — Janoshik Verified"
tagline_x = 80

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
