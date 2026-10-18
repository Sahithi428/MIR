import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

OUTPUT_DIR = Path(__file__).parent / 'static' / 'images'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ITEMS = [
    {'filename': 'mango_pickle.jpg', 'title': 'Mango Pickle', 'type': 'pickle', 'base_color': (224, 134, 26), 'accent': (179, 50, 20), 'ingredient': 'mango'},
    {'filename': 'gongura_pickle.jpg', 'title': 'Gongura Pickle', 'type': 'pickle', 'base_color': (84, 133, 49), 'accent': (50, 88, 39), 'ingredient': 'gongura'},
    {'filename': 'tomato_pickle.jpg', 'title': 'Tomato Pickle', 'type': 'pickle', 'base_color': (185, 77, 38), 'accent': (133, 31, 15), 'ingredient': 'tomato'},
    {'filename': 'allam_pickle.jpg', 'title': 'Ginger Pickle', 'type': 'pickle', 'base_color': (177, 125, 47), 'accent': (120, 76, 25), 'ingredient': 'ginger'},
    {'filename': 'lemon_pickle.jpg', 'title': 'Lemon Pickle', 'type': 'pickle', 'base_color': (226, 192, 82), 'accent': (188, 146, 31), 'ingredient': 'lemon'},
    {'filename': 'cut_mango_pickle.jpg', 'title': 'Cut Mango Pickle', 'type': 'pickle', 'base_color': (220, 126, 24), 'accent': (162, 48, 22), 'ingredient': 'mango'},
    {'filename': 'prawns_pickle.jpg', 'title': 'Prawns Pickle', 'type': 'pickle', 'base_color': (178, 93, 49), 'accent': (124, 36, 20), 'ingredient': 'prawns'},
    {'filename': 'chicken_pickle.jpg', 'title': 'Chicken Pickle', 'type': 'pickle', 'base_color': (150, 72, 43), 'accent': (103, 38, 26), 'ingredient': 'chicken'},
    {'filename': 'chicken_bone_pickle.jpg', 'title': 'Chicken Pickle', 'type': 'pickle', 'base_color': (142, 63, 35), 'accent': (96, 32, 23), 'ingredient': 'chicken'},
    {'filename': 'mutton_pickle.jpg', 'title': 'Mutton Pickle', 'type': 'pickle', 'base_color': (134, 60, 31), 'accent': (95, 34, 19), 'ingredient': 'mutton'},
    {'filename': 'fish_pickle.jpg', 'title': 'Fish Pickle', 'type': 'pickle', 'base_color': (170, 86, 42), 'accent': (115, 35, 19), 'ingredient': 'fish'},
    {'filename': 'andhra_karam_podi.jpg', 'title': 'Andhra Karam Podi', 'type': 'podi', 'base_color': (176, 65, 28), 'accent': (110, 35, 18), 'ingredient': 'chilli'},
    {'filename': 'peanut_podi.jpg', 'title': 'Peanut Podi', 'type': 'podi', 'base_color': (204, 157, 89), 'accent': (138, 93, 44), 'ingredient': 'peanut'},
    {'filename': 'kandi_podi.jpg', 'title': 'Kandi Podi', 'type': 'podi', 'base_color': (206, 162, 79), 'accent': (145, 101, 41), 'ingredient': 'dal'},
    {'filename': 'idli_karam_podi.jpg', 'title': 'Idli Karam Podi', 'type': 'podi', 'base_color': (182, 67, 32), 'accent': (106, 26, 16), 'ingredient': 'chilli'},
    {'filename': 'nalla_karam.jpg', 'title': 'Nalla Karam Podi', 'type': 'podi', 'base_color': (116, 59, 32), 'accent': (82, 44, 27), 'ingredient': 'dark spice'},
    {'filename': 'curry_leaf_podi.jpg', 'title': 'Curry Leaf Podi', 'type': 'podi', 'base_color': (96, 148, 76), 'accent': (58, 93, 42), 'ingredient': 'curry leaf'},
    {'filename': 'sunnundalu_laddu.jpg', 'title': 'Sunnundalu', 'type': 'sweet', 'base_color': (188, 136, 74), 'accent': (128, 86, 32), 'ingredient': 'laddu'},
    {'filename': 'ariselu.jpg', 'title': 'Ariselu', 'type': 'sweet', 'base_color': (179, 103, 44), 'accent': (116, 71, 27), 'ingredient': 'sweet'},
    {'filename': 'murukku.jpg', 'title': 'Murukku', 'type': 'snack', 'base_color': (202, 151, 83), 'accent': (154, 103, 35), 'ingredient': 'snack'},
    {'filename': 'bellam_gavvalu.jpg', 'title': 'Bellam Gavvalu', 'type': 'sweet', 'base_color': (188, 124, 62), 'accent': (117, 73, 25), 'ingredient': 'sweet'},
    {'filename': 'chekkalu.jpg', 'title': 'Chekkalu', 'type': 'snack', 'base_color': (194, 157, 90), 'accent': (140, 101, 42), 'ingredient': 'cracker'},
    {'filename': 'boondhi_laddu.jpg', 'title': 'Boondhi Laddu', 'type': 'sweet', 'base_color': (203, 140, 78), 'accent': (128, 82, 30), 'ingredient': 'laddu'},
    {'filename': 'millet_mix.jpg', 'title': 'Millet Mix', 'type': 'podi', 'base_color': (183, 143, 79), 'accent': (117, 88, 42), 'ingredient': 'millet'},
    {'filename': 'flax_seed_podi.jpg', 'title': 'Flax Seed Podi', 'type': 'podi', 'base_color': (126, 92, 50), 'accent': (92, 62, 36), 'ingredient': 'flax'},
    {'filename': 'dry_fruit_laddu.jpg', 'title': 'Dry Fruit Laddu', 'type': 'sweet', 'base_color': (176, 128, 72), 'accent': (106, 69, 30), 'ingredient': 'dry fruit'},
    {'filename': 'ragi_malt.jpg', 'title': 'Ragi Malt', 'type': 'podi', 'base_color': (120, 91, 56), 'accent': (81, 56, 35), 'ingredient': 'malt'},
    {'filename': 'ribbon_pakoda.jpg', 'title': 'Ribbon Pakoda', 'type': 'snack', 'base_color': (210, 169, 80), 'accent': (149, 101, 35), 'ingredient': 'snack'},
    {'filename': 'corn_flakes_mixture.jpg', 'title': 'Corn Flakes Mixture', 'type': 'snack', 'base_color': (203, 149, 79), 'accent': (119, 81, 31), 'ingredient': 'mixture'},
    {'filename': 'chegodilu.jpg', 'title': 'Chegodilu', 'type': 'snack', 'base_color': (190, 110, 59), 'accent': (118, 62, 28), 'ingredient': 'snack'},
    {'filename': 'andhra_mixture.jpg', 'title': 'Andhra Mixture', 'type': 'snack', 'base_color': (199, 139, 72), 'accent': (125, 78, 31), 'ingredient': 'mixture'}
]

random.seed(42)


def add_vignette(img, dark=0.3):
    w, h = img.size
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(h):
        alpha = int((y / h) * 140 * dark)
        d.line((0, y, w, y), fill=(0, 0, 0, alpha))
    return Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')


def apply_texture(img, color):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(1500):
        x = random.randint(0, img.width)
        y = random.randint(0, img.height)
        s = random.randint(1, 3)
        d.ellipse((x, y, x + s, y + s), fill=(color[0], color[1], color[2], 18))
    return Image.alpha_composite(img.convert('RGBA'), layer).convert('RGB')


def draw_bowl(img, cx, cy, radius, fill_color):
    d = ImageDraw.Draw(img, 'RGBA')
    d.ellipse((cx - radius - 25, cy - radius + 25, cx + radius + 25, cy + radius + 78), fill=(30, 18, 10, 85))
    d.ellipse((cx - radius - 20, cy - radius - 18, cx + radius + 20, cy + radius + 18), fill=(196, 139, 70, 255))
    d.ellipse((cx - radius - 15, cy - radius - 12, cx + radius + 15, cy + radius + 12), fill=(235, 192, 128, 255))
    d.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(fill_color[0], fill_color[1], fill_color[2], 255))
    d.ellipse((cx - radius + 12, cy - radius + 12, cx + radius - 12, cy + radius - 12), fill=(fill_color[0] - 18, fill_color[1] - 18, fill_color[2] - 18, 255))


def draw_pickle_content(img, cx, cy, radius, base_color, accent):
    d = ImageDraw.Draw(img, 'RGBA')
    for i in range(220):
        x = random.randint(cx - radius + 25, cx + radius - 25)
        y = random.randint(cy - radius + 25, cy + radius - 25)
        r = random.randint(10, 28)
        if i % 7 == 0:
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 219, 112, 210))
        else:
            d.ellipse((x - r, y - r, x + r, y + r), fill=(base_color[0], base_color[1], base_color[2], 220))
    for _ in range(70):
        x = random.randint(cx - radius + 18, cx + radius - 18)
        y = random.randint(cy - radius + 18, cy + radius - 18)
        d.ellipse((x, y, x + 4, y + 4), fill=(38, 26, 18, 210))
    for _ in range(20):
        x = random.randint(cx - radius + 30, cx + radius - 30)
        y = random.randint(cy - radius + 30, cy + radius - 30)
        d.ellipse((x - 18, y - 8, x + 18, y + 8), fill=(accent[0], accent[1], accent[2], 220))


def draw_podi_content(img, cx, cy, radius, base_color, accent):
    d = ImageDraw.Draw(img, 'RGBA')
    for i in range(320):
        x = random.randint(cx - radius + 15, cx + radius - 15)
        y = random.randint(cy - radius + 15, cy + radius - 15)
        s = random.randint(3, 12)
        shade = (base_color[0] + random.randint(-18, 18), base_color[1] + random.randint(-18, 18), base_color[2] + random.randint(-18, 18))
        d.ellipse((x, y, x + s, y + s), fill=(shade[0], shade[1], shade[2], 255))
    for _ in range(25):
        x = random.randint(cx - radius + 30, cx + radius - 30)
        y = random.randint(cy - radius + 30, cy + radius - 30)
        d.ellipse((x - 18, y - 9, x + 18, y + 9), fill=(accent[0], accent[1], accent[2], 180))


def draw_snack_content(img, cx, cy, radius, base_color, accent):
    d = ImageDraw.Draw(img, 'RGBA')
    for i in range(180):
        x = random.randint(cx - radius + 20, cx + radius - 20)
        y = random.randint(cy - radius + 20, cy + radius - 20)
        w = random.randint(16, 28)
        h = random.randint(10, 18)
        if i % 3 == 0:
            d.rounded_rectangle((x, y, x + w, y + h), radius=7, fill=(base_color[0] + 10, base_color[1] + 12, base_color[2] + 10, 255))
        else:
            d.rounded_rectangle((x, y, x + w, y + h), radius=7, fill=(accent[0], accent[1], accent[2], 200))


def draw_sweet_content(img, cx, cy, radius, base_color, accent):
    d = ImageDraw.Draw(img, 'RGBA')
    for i in range(90):
        x = random.randint(cx - radius + 30, cx + radius - 30)
        y = random.randint(cy - radius + 30, cy + radius - 30)
        w = random.randint(20, 50)
        h = random.randint(18, 38)
        d.ellipse((x, y, x + w, y + h), fill=(base_color[0], base_color[1], base_color[2], 220))
    for _ in range(50):
        x = random.randint(cx - radius + 25, cx + radius - 25)
        y = random.randint(cy - radius + 25, cy + radius - 25)
        d.ellipse((x, y, x + 7, y + 7), fill=(255, 220, 120, 180))


def draw_leaves(img):
    d = ImageDraw.Draw(img, 'RGBA')
    leaves = [(120, 150, 0.9, -20), (820, 180, 0.9, 20), (130, 520, 0.8, 12), (810, 530, 0.8, -16)]
    for x, y, scale, rot in leaves:
        leaf = Image.new('RGBA', (180, 180), (0, 0, 0, 0))
        ld = ImageDraw.Draw(leaf)
        ld.ellipse((52, 52, 128, 120), fill=(52, 123, 54, 180))
        ld.polygon((90, 20, 125, 90, 90, 150, 55, 92), fill=(72, 155, 64, 200))
        leaf = leaf.rotate(rot, expand=True)
        leaf = leaf.resize((int(180 * scale), int(180 * scale)))
        img = Image.alpha_composite(img.convert('RGBA'), leaf, ).convert('RGBA')
        img.paste(leaf, (x, y), leaf)
    return img


def create_item(item):
    w, h = 1000, 750
    bg = Image.new('RGB', (w, h), (245, 236, 220))
    d = ImageDraw.Draw(bg)
    for i in range(0, w, 30):
        d.line((i, 0, i + 40, h), fill=(255, 255, 255, 30), width=1)
    bg = apply_texture(bg, item['accent'])
    bg = add_vignette(bg, 0.18)

    # warm wooden table shadow
    d = ImageDraw.Draw(bg, 'RGBA')
    d.rounded_rectangle((90, 95, 910, 650), radius=34, fill=(247, 238, 222, 255), outline=(161, 104, 49), width=5)
    d.rounded_rectangle((110, 120, 890, 630), radius=28, fill=(232, 204, 161, 255), outline=(138, 87, 33), width=3)

    cx, cy, radius = 500, 360, 210
    draw_bowl(bg, cx, cy, radius, item['base_color'])

    if item['type'] == 'pickle':
        draw_pickle_content(bg, cx, cy, radius - 24, item['base_color'], item['accent'])
    elif item['type'] == 'podi':
        draw_podi_content(bg, cx, cy, radius - 20, item['base_color'], item['accent'])
    elif item['type'] == 'snack':
        draw_snack_content(bg, cx, cy, radius - 24, item['base_color'], item['accent'])
    elif item['type'] == 'sweet':
        draw_sweet_content(bg, cx, cy, radius - 24, item['base_color'], item['accent'])

    # small ingredient accents around bowl
    for _ in range(18):
        x = random.randint(130, 870)
        y = random.randint(140, 600)
        d.ellipse((x, y, x + 10, y + 10), fill=(item['accent'][0], item['accent'][1], item['accent'][2], 180))

    # soft glossy highlight before final
    hl = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    hd.ellipse((cx - radius + 40, cy - radius + 15, cx + radius - 40, cy + radius - 15), fill=(255, 255, 255, 35))
    bg = Image.alpha_composite(bg.convert('RGBA'), hl).convert('RGB')
    bg = add_vignette(bg, 0.12)
    bg = bg.filter(ImageFilter.GaussianBlur(0.2))
    bg = ImageEnhance.Color(bg).enhance(1.02)
    bg = ImageEnhance.Contrast(bg).enhance(1.05)
    bg = bg.resize((1000, 750))
    bg.save(OUTPUT_DIR / item['filename'], quality=95, optimize=True)


for item in ITEMS:
    create_item(item)

print(f'Generated {len(ITEMS)} premium realistic product shots in {OUTPUT_DIR}')
