import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = r'c:\Users\Hp\Desktop\mana_inti_ruchulu_rag\static\images'
os.makedirs(OUTPUT_DIR, exist_ok=True)

PICKLES = [
    {
        'filename': 'mango_pickle.jpg',
        'title': 'Avakaya Mango Pickle',
        'oil_color': (190, 40, 15),
        'chunk_color': (220, 160, 40),
        'skin_color': (60, 120, 40),
        'spice_color': (140, 20, 10),
        'type': 'mango'
    },
    {
        'filename': 'gongura_pickle.jpg',
        'title': 'Gongura Leaf Pickle',
        'oil_color': (120, 30, 15),
        'chunk_color': (45, 95, 35),
        'skin_color': (30, 70, 25),
        'spice_color': (90, 15, 10),
        'type': 'gongura'
    },
    {
        'filename': 'tomato_pickle.jpg',
        'title': 'Spiced Tomato Pickle',
        'oil_color': (200, 35, 15),
        'chunk_color': (210, 50, 25),
        'skin_color': (160, 25, 15),
        'spice_color': (130, 15, 10),
        'type': 'tomato'
    },
    {
        'filename': 'allam_pickle.jpg',
        'title': 'Allam (Ginger) Pickle',
        'oil_color': (170, 65, 20),
        'chunk_color': (210, 140, 50),
        'skin_color': (150, 90, 30),
        'spice_color': (110, 35, 15),
        'type': 'ginger'
    },
    {
        'filename': 'lemon_pickle.jpg',
        'title': 'Lemon (Nimmakaya) Pickle',
        'oil_color': (180, 120, 25),
        'chunk_color': (225, 185, 40),
        'skin_color': (200, 170, 30),
        'spice_color': (140, 70, 15),
        'type': 'lemon'
    },
    {
        'filename': 'cut_mango_pickle.jpg',
        'title': 'Cut Mango Pickle',
        'oil_color': (185, 50, 20),
        'chunk_color': (225, 170, 45),
        'skin_color': (70, 135, 45),
        'spice_color': (135, 25, 10),
        'type': 'mango'
    },
    {
        'filename': 'prawns_pickle.jpg',
        'title': 'Royyala Prawns Pickle',
        'oil_color': (180, 30, 20),
        'chunk_color': (220, 110, 70),
        'skin_color': (190, 80, 50),
        'spice_color': (130, 20, 15),
        'type': 'prawns'
    },
    {
        'filename': 'chicken_pickle.jpg',
        'title': 'Boneless Chicken Pickle',
        'oil_color': (175, 35, 20),
        'chunk_color': (180, 80, 40),
        'skin_color': (140, 50, 25),
        'spice_color': (120, 20, 15),
        'type': 'meat'
    },
    {
        'filename': 'chicken_bone_pickle.jpg',
        'title': 'Chicken Pickle (With Bone)',
        'oil_color': (170, 30, 20),
        'chunk_color': (170, 75, 35),
        'skin_color': (130, 45, 20),
        'spice_color': (115, 15, 10),
        'type': 'meat'
    },
    {
        'filename': 'mutton_pickle.jpg',
        'title': 'Tender Mutton Pickle',
        'oil_color': (150, 25, 20),
        'chunk_color': (130, 50, 30),
        'skin_color': (90, 30, 20),
        'spice_color': (100, 15, 10),
        'type': 'meat'
    },
    {
        'filename': 'fish_pickle.jpg',
        'title': 'Spicy Fish Pickle',
        'oil_color': (175, 40, 20),
        'chunk_color': (190, 100, 50),
        'skin_color': (120, 60, 35),
        'spice_color': (125, 20, 15),
        'type': 'fish'
    }
]

W, H = 800, 600
random.seed(42)

for item in PICKLES:
    # Wood tabletop background
    img = Image.new('RGB', (W, H), (60, 40, 25))
    draw = ImageDraw.Draw(img)

    # Draw wooden plank texture
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=(45, 28, 16), width=2)
        for x in range(0, W, 8):
            v = random.randint(-10, 10)
            draw.line([(x, y), (x + 8, y)], fill=(60 + v, 40 + v, 25 + v))

    # Ceramic Jar / Bowl Shadow
    cx, cy, r = W // 2, H // 2 - 20, 190
    draw.ellipse([cx - r - 15, cy - r + 20, cx + r + 15, cy + r + 40], fill=(20, 12, 8))

    # Ceramic Clay Bowl Outer Ring
    draw.ellipse([cx - r - 10, cy - r - 10, cx + r + 10, cy + r + 10], fill=(230, 215, 185))
    draw.ellipse([cx - r - 2, cy - r - 2, cx + r + 2, cy + r + 2], fill=(180, 140, 100))

    # Bowl Interior Base Oil & Gravy
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=item['oil_color'])

    # Oil sheen gradient
    for rad in range(r, 0, -4):
        alpha = int(100 * (rad / r))
        o_color = (
            min(255, item['oil_color'][0] + 30),
            min(255, item['oil_color'][1] + 20),
            min(255, item['oil_color'][2] + 10)
        )
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=o_color, width=2)

    # Render Pickle Chunks inside bowl
    num_chunks = 18
    for i in range(num_chunks):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(20, r - 45)
        px = int(cx + dist * math.cos(angle))
        py = int(cy + dist * math.sin(angle))
        size = random.randint(22, 38)

        # Draw chunk base
        draw.ellipse([px - size, py - size, px + size, py + size], fill=item['chunk_color'])

        # Skin/Border on chunk
        if item['type'] == 'mango':
            draw.arc([px - size, py - size, px + size, py + size], start=0, end=140, fill=item['skin_color'], width=5)
        elif item['type'] == 'prawns':
            # Curved prawn shape
            draw.arc([px - size + 4, py - size + 4, px + size - 4, py + size - 4], start=30, end=240, fill=(240, 140, 90), width=6)
        elif item['type'] == 'meat':
            draw.ellipse([px - size//2, py - size//2, px + size//2, py + size//2], fill=item['skin_color'])

        # Red chili spice oil coating
        draw.ellipse([px - size//3, py - size//3, px + size//3, py + size//3], fill=item['spice_color'])

    # Mustard seeds & spice garnish floating in oil
    for _ in range(60):
        angle = random.uniform(0, 2 * math.pi)
        dist = random.uniform(10, r - 25)
        sx = int(cx + dist * math.cos(angle))
        sy = int(cy + dist * math.sin(angle))
        # Yellow mustard seeds
        draw.ellipse([sx - 2, sy - 2, sx + 2, sy + 2], fill=(245, 210, 90))

    # Whole dried red chillies floating
    for _ in range(3):
        rx = int(cx + random.randint(-80, 80))
        ry = int(cy + random.randint(-80, 80))
        draw.line([(rx - 15, ry - 8), (rx + 15, ry + 8)], fill=(160, 15, 10), width=6)
        draw.ellipse([rx + 12, ry + 5, rx + 18, ry + 11], fill=(40, 80, 20)) # Stem

    # Garlic cloves
    for _ in range(4):
        gx = int(cx + random.randint(-100, 100))
        gy = int(cy + random.randint(-100, 100))
        draw.ellipse([gx - 7, gy - 12, gx + 7, gy + 12], fill=(245, 240, 220))

    # Label Banner at bottom
    box_h = 110
    draw.rectangle([30, H - box_h - 25, W - 30, H - 25], fill=(15, 23, 42), outline=(220, 38, 38), width=2)
    draw.text((50, H - box_h - 10), f"MANA INTI RUCHULU • AUTHENTIC ANDHRA PICKLE", fill=(234, 179, 8))
    draw.text((50, H - box_h + 15), item['title'].upper(), fill=(255, 255, 255))
    draw.text((50, H - box_h + 45), "Handcrafted in Pasuvullanka • Pure Cold-Pressed Oil & Guntur Masala", fill=(203, 213, 225))
    draw.text((50, H - box_h + 70), "100% Homemade • Zero Chemical Preservatives • All-India Shipping", fill=(16, 185, 129))

    out_path = os.path.join(OUTPUT_DIR, item['filename'])
    img.save(out_path, quality=95)
    print(f"Generated authentic pickle photo -> {item['filename']}")

print("\nAll 11 authentic pickle food photos generated successfully!")
