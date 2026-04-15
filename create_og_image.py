#!/usr/bin/env python3
from PIL import Image, ImageDraw

# Create 1200x630 canvas
width, height = 1200, 630
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Gradient background (navy to blue, left to right)
for x in range(width):
    # Interpolate between navy (#1A2B44) and blue (#2563EB)
    r = int(26 + (37 - 26) * x / width)
    g = int(43 + (99 - 43) * x / width)
    b = int(68 + (235 - 68) * x / width)
    draw.line([(x, 0), (x, height)], fill=(r, g, b))

# For now, just save the gradient
# We'll add logo separately if needed
img.save('/Users/frabrizio/.openclaw/workspace/vantix/og-image-new.jpg', 'JPEG', quality=95)
print("Created og-image-new.jpg with gradient background")
print("Next: overlay the VX logo centered (can use logo SVG or favicon)")
