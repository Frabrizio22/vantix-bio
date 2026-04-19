#!/usr/bin/env python3
from PIL import Image

# Image dimensions
WIDTH = 1200
HEIGHT = 630

# All white background
img = Image.new('RGB', (WIDTH, HEIGHT), (255, 255, 255))

# Load and center the full logo
logo = Image.open('/Users/frabrizio/.openclaw/workspace/vantix/logo.png')

# Resize logo - nearly full height
logo_height = 600
aspect_ratio = logo.width / logo.height
logo_width = int(logo_height * aspect_ratio)
logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)

# Center horizontally, move down slightly
logo_x = (WIDTH - logo_width) // 2
logo_y = (HEIGHT - logo_height) // 2 + 20  # Move down 20px

# Paste logo
if logo.mode == 'RGBA':
    img.paste(logo, (logo_x, logo_y), logo)
else:
    img.paste(logo, (logo_x, logo_y))

# Save
output_path = '/Users/frabrizio/.openclaw/workspace/vantix/og-image.jpg'
img.save(output_path, 'JPEG', quality=95, optimize=True)
print("DONE")
