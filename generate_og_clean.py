#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

# Image dimensions
WIDTH = 1200
HEIGHT = 630

# Colors
WHITE = (255, 255, 255)
DARK_BLUE = (53, 91, 138)
NAVY = (30, 58, 95)
LIGHT_BLUE = (73, 115, 176)
TEXT_WHITE = (255, 255, 255)

# Create image
img = Image.new('RGB', (WIDTH, HEIGHT), WHITE)
draw = ImageDraw.Draw(img)

# Top half is white (already done)
top_height = HEIGHT // 2

# Bottom half is dark blue
draw.rectangle([(0, top_height), (WIDTH, HEIGHT)], fill=DARK_BLUE)

# Draw hexagon icon centered in top half
center_x = WIDTH // 2
center_y = top_height // 2

# Hexagon dimensions
hex_size = 100  # Distance from center to vertex

# Calculate hexagon vertices
import math
vertices = []
for i in range(6):
    angle = math.pi / 3 * i - math.pi / 2  # Start from top
    x = center_x + hex_size * math.cos(angle)
    y = center_y + hex_size * math.sin(angle)
    vertices.append((x, y))

# Draw hexagon outline
draw.polygon(vertices, outline=NAVY, width=4)

# Draw connection nodes (circles at vertices)
for x, y in vertices:
    draw.ellipse([(x-8, y-8), (x+8, y+8)], fill=LIGHT_BLUE)

# Draw VX text in center
try:
    font_vx = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 70)
except:
    font_vx = ImageFont.load_default()

# Draw V (dark) and X (light blue)
v_bbox = draw.textbbox((0, 0), "V", font=font_vx)
v_width = v_bbox[2] - v_bbox[0]
x_bbox = draw.textbbox((0, 0), "X", font=font_vx)
x_width = x_bbox[2] - x_bbox[0]
total_width = v_width + x_width

v_x = center_x - total_width // 2
v_y = center_y - 30

draw.text((v_x, v_y), "V", fill=NAVY, font=font_vx)
draw.text((v_x + v_width - 5, v_y), "X", fill=LIGHT_BLUE, font=font_vx)

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
output_path = '/Users/frabrizio/.openclaw/workspace/vantix/og-image-new.jpg'
img.save(output_path, 'JPEG', quality=95, optimize=True)
print(f"Saved: {output_path}")
