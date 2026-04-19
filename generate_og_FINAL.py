#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

# Image dimensions
WIDTH = 1200
HEIGHT = 630

# Colors
WHITE = (255, 255, 255)
DARK_BLUE = (53, 91, 138)
TEXT_WHITE = (255, 255, 255)

# Create image
img = Image.new('RGB', (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Top half is white
top_height = HEIGHT // 2

# Bottom half is dark blue
draw.rectangle([(0, top_height), (WIDTH, HEIGHT)], fill=DARK_BLUE)

# Load and center the FULL logo in top half
logo = Image.open('/Users/frabrizio/.openclaw/workspace/vantix/logo.png')

# Resize logo to fit nicely
logo_height = 240
aspect_ratio = logo.width / logo.height
logo_width = int(logo_height * aspect_ratio)
logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

# Center in top half
logo_x = (WIDTH - logo_width) // 2
logo_y = (top_height - logo_height) // 2

# Paste logo
if logo.mode == 'RGBA':
    img.paste(logo, (logo_x, logo_y), logo)
else:
    img.paste(logo, (logo_x, logo_y))

# Add text to bottom
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 54)
    font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
except:
    font_large = ImageFont.load_default()
    font_small = ImageFont.load_default()

tagline = "Forensic-Grade Peptides — Janoshik Verified"
tagline_x = 80
text_section_height = HEIGHT - top_height
tagline_y = top_height + (text_section_height // 2) - 35

draw.text((tagline_x, tagline_y), tagline, fill=TEXT_WHITE, font=font_large)

url = "vantixbio.com"
url_y = tagline_y + 65
draw.text((tagline_x, url_y), url, fill=(160, 180, 200), font=font_small)

# Save
output_path = '/Users/frabrizio/.openclaw/workspace/vantix/og-image.jpg'
img.save(output_path, 'JPEG', quality=95, optimize=True)
print(f"DONE: {output_path}")
