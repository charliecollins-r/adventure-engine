"""Build the Act 1 walkthrough images from playthrough screenshots.

Input: a folder of 960x540 PNG screenshots captured by scripts/playthrough/full.cjs and extras.cjs.
Output (walkthrough/): compressed WebP screenshots, a deck map with room thumbnails, and the vent maze
grid with the route drawn on it. The maze layout is read from scripts/build_vent_maze.py (CELLS), so the
diagram always matches the game.

Usage (from scenarios/the-harvest):
  python3 scripts/build_walkthrough_images.py <shots_dir> walkthrough
"""
import os, re, sys, ast
from PIL import Image, ImageDraw, ImageFont

SHOTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F = lambda n: ImageFont.truetype(FONT, n)
GOLD, INK, BG, DIM = (240, 196, 92), (232, 228, 214), (16, 18, 22), (120, 126, 136)

# 1. Screenshots -> WebP
KEEP = None  # all
for f in sorted(os.listdir(SHOTS)):
    if f.endswith('.png'):
        Image.open(os.path.join(SHOTS, f)).convert('RGB').save(os.path.join(OUT, f[:-4] + '.webp'), quality=80, method=6)

def thumb(name, w, h):
    return Image.open(os.path.join(SHOTS, name + '.png')).convert('RGB').resize((w, h), Image.LANCZOS)

def tile(canvas, draw, name, label, x, y, w, h, hl=False, sub=None):
    canvas.paste(thumb(name, w, h), (x, y))
    draw.rectangle([x - 2, y - 2, x + w + 1, y + h + 1], outline=GOLD if hl else (70, 74, 82), width=3 if hl else 2)
    draw.rectangle([x, y + h - 24, x + w, y + h], fill=(0, 0, 0))
    draw.text((x + 6, y + h - 22), label, fill=GOLD if hl else INK, font=F(15))
    if sub: draw.text((x + 6, y + 4), sub, fill=INK, font=F(13), stroke_width=2, stroke_fill=(0, 0, 0))

# 2. Deck map
W, H, GX, GY = 300, 169, 70, 70
grid = {'stasis': (0, 0), 'corridor': (1, 1), 'lab': (0, 1), 'security': (2, 1), 'feeding': (1, 2),
        'morgue': (0, 2), 'archive': (2, 2), 'shaft': (2, 0), 'maze': (3, 0), 'airlock': (3, 1)}
names = {'stasis': ('01_stasis_hold', 'Stasis Hold (start)'), 'corridor': ('02_corridor', 'Containment Corridor'),
         'lab': ('03_processing_lab', 'Processing Lab'), 'security': ('06_security_hub', 'Security Hub'),
         'feeding': ('09_feeding_station', 'Feeding Station'), 'morgue': ('11_morgue', 'Morgue'),
         'archive': ('12_archive', 'Specimen Archive'), 'shaft': ('17_vent_shaft', 'Ventilation Shaft'),
         'maze': ('18_vent_junction', 'Vent maze (18 screens)'), 'airlock': ('24_airlock_bay', 'Airlock Bay (end)')}
subs = {'stasis': 'tag · shard · the gap', 'lab': 'probe · jar · strap · terminal', 'security': 'key card · helmet · override',
        'feeding': 'paste · prisoner', 'morgue': 'hook · tendril', 'archive': 'crystal · hologram',
        'shaft': 'map', 'maze': 'deadly gas · deadly fan', 'airlock': 'key card → panel'}
edges = [('stasis', 'corridor', ''), ('corridor', 'lab', ''), ('corridor', 'security', ''), ('corridor', 'feeding', ''),
         ('feeding', 'morgue', ''), ('feeding', 'archive', ''), ('corridor', 'shaft', 'floor vent: needs override'),
         ('shaft', 'maze', ''), ('maze', 'airlock', 'helmet + probe')]
cw, ch = 4 * W + 3 * GX + 80, 3 * H + 2 * GY + 120
im = Image.new('RGB', (cw, ch), BG); d = ImageDraw.Draw(im)
d.text((40, 24), 'The Harvest · Act 1 deck map', fill=GOLD, font=F(30))
org = lambda k: (40 + grid[k][0] * (W + GX), 90 + grid[k][1] * (H + GY))
ctr = lambda k: (org(k)[0] + W // 2, org(k)[1] + H // 2)
for a, b, lab in edges:
    (x1, y1), (x2, y2) = ctr(a), ctr(b)
    d.line([x1, y1, x2, y2], fill=(200, 150, 70) if lab else (110, 116, 126), width=6)
for k in grid:
    tile(im, d, names[k][0], names[k][1], *org(k), W, H, hl=k in ('stasis', 'airlock'), sub=subs.get(k))
for a, b, lab in edges:
    if lab:
        (x1, y1), (x2, y2) = ctr(a), ctr(b); mx, my = (x1 + x2) // 2, (y1 + y2) // 2
        tw = d.textlength(lab, font=F(15)); d.rectangle([mx - tw / 2 - 8, my - 13, mx + tw / 2 + 8, my + 13], fill=(60, 40, 14))
        d.text((mx - tw / 2, my - 10), lab, fill=GOLD, font=F(15))
im.save(os.path.join(OUT, 'deck_map.webp'), quality=84, method=6)

# 3. Vent maze grid with the route
src = open(os.path.join(os.path.dirname(__file__), 'build_vent_maze.py')).read()
CELLS = ast.literal_eval(re.search(r'CELLS = (\{.*?\})\n', src, re.S).group(1))
SPECIAL = {'ENTRY': ('17_vent_shaft', 'Shaft (from corridor)'), 'J': ('18_vent_junction', 'Junction'),
           'GAS': ('20_vent_gas', 'Gas: needs helmet'), 'FAN': ('21_vent_fan', 'Fan: jam with probe'),
           'EXIT': ('23_vent_exit', 'Exit → Airlock'), 'COLL': ('19_vent_collapsed', 'Collapsed (skeleton)')}
ROUTE = ['ENTRY', 'J', 'A', 'B', 'E', 'F', 'GAS', 'FAN', 'EXIT']
W2, H2, G2 = 220, 124, 46
xs = [c[0][0] for c in CELLS.values()]; ys = [c[0][1] for c in CELLS.values()]
cols, rows = max(xs) + 1, max(ys) + 1
cw, ch = cols * W2 + (cols - 1) * G2 + 80, rows * H2 + (rows - 1) * G2 + 150
im = Image.new('RGB', (cw, ch), BG); d = ImageDraw.Draw(im)
d.text((40, 22), 'Vent maze · north is up · gold = the way out', fill=GOLD, font=F(26))
org = lambda c: (40 + CELLS[c][0][0] * (W2 + G2), 80 + (rows - 1 - CELLS[c][0][1]) * (H2 + G2))
ctr = lambda c: (org(c)[0] + W2 // 2, org(c)[1] + H2 // 2)
pos = {v[0]: k for k, v in CELLS.items()}
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
route_edges = {frozenset(p) for p in zip(ROUTE, ROUTE[1:])}
for c, ((x, y), dirs) in CELLS.items():
    for dd in dirs:
        n = pos.get((x + D[dd][0], y + D[dd][1]))
        if n:
            hl = frozenset((c, n)) in route_edges
            d.line([*ctr(c), *ctr(n)], fill=GOLD if hl else (96, 100, 110), width=10 if hl else 6)
for c in CELLS:
    if c in SPECIAL: name, label = SPECIAL[c]
    else: name, label = 'maze_' + c.lower(), f'Duct {c}' + (' (dead end)' if c == 'L' else '')
    tile(im, d, name, label, *org(c), W2, H2, hl=c in ROUTE)
im.save(os.path.join(OUT, 'vent_maze_route.webp'), quality=84, method=6)
print('wrote', len(os.listdir(OUT)), 'files to', OUT)
