#!/usr/bin/env python3
"""Create clean OG image: just VX logo on gradient, no text"""
from PIL import Image, ImageDraw, ImageFont

# Canvas
width, height = 1200, 630
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Gradient (navy to teal, diagonal)
for y in range(height):
    for x in range(width):
        # Navy (#1A2B44) to Blue (#2563EB) diagonal
        factor = (x + y) / (width + height)
        r = int(26 + (37 - 26) * factor)
        g = int(43 + (99 - 43) * factor)
        b = int(68 + (235 - 68) * factor)
        draw.point((x, y), fill=(r, g, b))

# Add white text "VX" centered (simple placeholder for logo)
# In production, would overlay actual VX logo SVG
try:
    # Try to use a bold font
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 200)
except:
    font = ImageFont.load_default()

text = "VX"
# Get text bounding box
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (width - text_width) // 2
y = (height - text_height) // 2 - 20

draw.text((x, y), text, fill='white', font=font)

# Add small tagline
try:
    small_font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 24)
except:
    small_font = font

tagline = "VANTIX BIO"
bbox = draw.textbbox((0, 0), tagline, font=small_font)
tag_width = bbox[2] - bbox[0]
tag_x = (width - tag_width) // 2
tag_y = y + text_height + 40

draw.text((tag_x, tag_y), tagline, fill=(255, 255, 255), font=small_font)

img.save('/Users/frabrizio/.openclaw/workspace/vantix/og-image.jpg', 'JPEG', quality=95, optimize=True)
print("✓ Created clean og-image.jpg (1200x630)")
print("  - Navy to blue gradient")
print("  - VX logo centered (text placeholder)")
print("  - No cut-off text")
