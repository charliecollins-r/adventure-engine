"""Draw the designer's map of the vent maze v6 proposal from scripts/vent_maze_v6_grid.json.

  python3 scripts/draw_vent_map_v6.py [out.png]      # default: design/vent_maze_v6_map.png   (needs Pillow)

North is up. Each square is one duct screen, coloured by zone; bars between squares are open ducts. The main route
is the dashed line; the two shortcuts are drawn in blue. Painted rooms are lettered (key on the right).
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
G = json.load(open(os.path.join(HERE, 'vent_maze_v6_grid.json')))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'design', 'vent_maze_v6_map.png')

S = 64                       # cell pitch
ML, MT = 70, 210             # margins (top holds the gas/fan/exit stack and the title)
W = G['width']
ROWS = max(int(k.split(',')[1]) for k in G['cells']) + 1
PANEL = 440
IMG_W, IMG_H = ML + W * S + 60 + PANEL, MT + ROWS * S + 120
ZONE = {'1': ('The Outer Ducts', (243, 220, 214), (150, 52, 44)),
        '2': ('The Gut', (220, 237, 222), (70, 132, 82)),
        '3': ('The Purge Core', (247, 226, 202), (206, 110, 30))}
INK, QUIET, ROUTE, SHORT = (36, 30, 28), (120, 110, 104), (255, 255, 255), (40, 110, 220)
LETTER = {'warren': 'W', 'lever': 'L', 'collapsed': 'X', 'vera': 'H', 'chapel': 'P', 'hollow': 'A', 'camp': 'C', 'nursery': 'N', 'shaft': 'S',
          'cache': 'K', 'seam': 'E', 'grate': 'G'}
NAME = {'warren': 'The Warren: the colony city, 4 tiny screens', 'lever': 'Lever: unlocks the door into the Gut', 'collapsed': 'Collapsed Section (datapad, chip)',
        'vera': 'Vera, the woman in the wall (good)', 'chapel': "The Penitent's chapel, 2 deep (wary)",
        'hollow': "The Archivist's hollow, 2 deep (neutral)", 'camp': "Escapee's Camp, 2 deep (map piece, journal)",
        'nursery': "The Queen's court, 3 deep; Q = the Queen", 'shaft': 'Vertical Shaft (shortcut, needs the line)',
        'cache': "Collector's Cache, 2 deep (multitool)", 'seam': 'Hull seam (a view of Earth)',
        'grate': "Grate over the Curator's office"}
PATROL = (150, 70, 170)


def font(sz, bold=False):
    try: return ImageFont.truetype('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf', sz)
    except OSError: return ImageFont.load_default()


def zone_of(y):
    for z, (a, b) in G['zones'].items():
        if a <= y <= b: return z


def ctr(x, y):
    return (ML + x * S + S // 2, MT + (ROWS - 1 - y) * S + S // 2)


cells = {tuple(map(int, k.split(','))): v for k, v in G['cells'].items()}
special = {tuple(c): (k, i, len(ch)) for k, ch in G['rooms'].items() for i, c in enumerate(ch)}
purge = {tuple(c) for c in G['purge']}
breathing = {tuple(c) for c in G['breathing']}
core_breathing = {tuple(c) for c in G['breathing_zones']['3']}
grates = {tuple(c) for c in G['grates']}
folds = {tuple(c) for c in G['folds']}
air_rooms = {tuple(c) for k in G['air_rooms'] for c in G['rooms'][k]}
AIR = (40, 140, 200)
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}

im = Image.new('RGB', (IMG_W, IMG_H), (250, 247, 241))
dr = ImageDraw.Draw(im)

# zone bands
for z, (a, b) in G['zones'].items():
    name, band, col = ZONE[z]
    x0, y0 = ML - 10, MT + (ROWS - 1 - b) * S
    dr.rounded_rectangle([x0, y0 + 2, ML + W * S + 10, MT + (ROWS - a) * S - 2], 14, fill=band)
    dr.text((14, y0 + 8), f'{z}', font=font(30, True), fill=col)
# the torn half of the Gut
a, b = G['zones']['2']
tx0, ty0, tx1, ty1 = ML + G['torn_x'] * S, MT + (ROWS - 1 - b) * S + 4, ML + W * S + 8, MT + (ROWS - a) * S - 4
hatch = Image.new('RGBA', (tx1 - tx0, ty1 - ty0), (0, 0, 0, 0)); hd = ImageDraw.Draw(hatch)
for i in range(-(ty1 - ty0), tx1 - tx0, 14):
    hd.line([(i, ty1 - ty0), (i + (ty1 - ty0), 0)], fill=(180, 204, 182, 255), width=2)
im.paste(hatch, (tx0, ty0), hatch)
dr.line([(tx0 - 4, ty0 - 2), (tx0 - 4, ty1 + 2)], fill=(120, 150, 124), width=2)
dr.text((tx1 + 6, (ty0 + ty1) // 2), 'torn off\nthe map', font=font(12, True), fill=(70, 110, 76), anchor='lm')

# ducts between cells
for (x, y), ops in cells.items():
    col = ZONE[zone_of(y)][2]
    cx, cy = ctr(x, y)
    for d in ops:
        nx, ny = x + D[d][0], y + D[d][1]
        if (nx, ny) in cells or (d == 'S' and (x, y) == tuple(G['junction'])):
            ex, ey = ctr(nx, ny) if (nx, ny) in cells else (cx, cy + S // 2 + 10)
            dr.line([(cx, cy), ((cx + ex) // 2, (cy + ey) // 2)], fill=col, width=14)

# the main route
route = [ctr(*c) for c in G['route'][:G['route'].index(G['breath']['breath_path'][0])] + G['breath']['breath_path']]
for (ax, ay), (bx, by) in zip(route, route[1:]):
    n = int(max(abs(bx - ax), abs(by - ay)) // 8)
    for i in range(0, n, 2):
        t0, t1 = i / n, min(1, (i + 1) / n)
        dr.line([(ax + (bx - ax) * t0, ay + (by - ay) * t0), (ax + (bx - ax) * t1, ay + (by - ay) * t1)], fill=ROUTE, width=4)

# Warden patrol loops (drawn under the screens)
for side, loop in G['patrols'].items():
    pts = [ctr(*c) for c in loop] + [ctr(*loop[0])]
    dr.line(pts, fill=PATROL, width=22, joint='curve')
# cells
for (x, y), ops in cells.items():
    col = ZONE[zone_of(y)][2]
    cx, cy = ctr(x, y)
    if (x, y) in special and special[(x, y)][0] == 'warren':
        if special[(x, y)][1] == 0:
            x1, y1 = ctr(x + 1, y + 1)
            dr.rounded_rectangle([cx - 26, y1 - 26, x1 + 26, cy + 26], 14, fill=(255, 255, 255), outline=col, width=4)
            dr.text(((cx + x1) // 2, (cy + y1) // 2 - 8), 'WARREN', font=font(16, True), fill=col, anchor='mm')
            dr.text(((cx + x1) // 2, (cy + y1) // 2 + 12), 'colony city', font=font(11), fill=col, anchor='mm')
            dr.ellipse([x1 + 14, y1 - 32, x1 + 30, y1 - 16], fill=AIR)
        continue
    if (x, y) in special:
        name, i, depth = special[(x, y)]
        dr.rounded_rectangle([cx - 22, cy - 22, cx + 22, cy + 22], 9, fill=(255, 255, 255), outline=col, width=4)
        lt = 'Q' if name == 'nursery' and i == depth - 1 else LETTER[name]
        dr.text((cx - (5 if depth > 1 else 0), cy + 1), lt, font=font(22, True), fill=col, anchor='mm')
        if depth > 1: dr.text((cx + 12, cy + 9), str(i + 1), font=font(12, True), fill=col, anchor='mm')
        if (x, y) in air_rooms and i == 0: dr.ellipse([cx + 12, cy - 30, cx + 28, cy - 14], fill=AIR)
    elif (x, y) in purge:
        dr.rounded_rectangle([cx - 17, cy - 17, cx + 17, cy + 17], 6, fill=(30, 26, 24))
        dr.text((cx, cy + 1), '☠', font=font(24), fill=(255, 255, 255), anchor='mm')
    else:
        dr.rounded_rectangle([cx - 17, cy - 17, cx + 17, cy + 17], 6, fill=col)
        if (x, y) in breathing:
            bc = (200, 30, 30) if (x, y) in core_breathing else (30, 26, 24)
            dr.ellipse([cx - 25, cy - 25, cx + 25, cy + 25], outline=bc, width=3)
            dr.ellipse([cx - 30, cy - 30, cx + 30, cy + 30], outline=bc, width=1)
        if (x, y) in grates:
            for k in (-8, 0, 8):
                dr.line([(cx + k, cy - 12), (cx + k, cy + 12)], fill=(30, 26, 24), width=3)
            dr.line([(cx - 12, cy - 12), (cx + 12, cy - 12)], fill=(30, 26, 24), width=2)
            dr.line([(cx - 12, cy + 12), (cx + 12, cy + 12)], fill=(30, 26, 24), width=2)
        if (x, y) in folds:
            dr.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=AIR, outline=(255, 255, 255), width=2)
        if 'S' not in ops and (x, y) != tuple(G['junction']):     # sealed behind: the lip
            dr.line([(cx - 13, cy + 12), (cx + 13, cy + 12)], fill=(255, 255, 255), width=3)

# the junction, the entry shaft and the way out
jx, jy = ctr(*G['junction'])
dr.rounded_rectangle([jx - 24, jy - 22, jx + 24, jy + 22], 9, fill=(255, 255, 255), outline=ZONE['1'][2], width=4)
dr.text((jx, jy + 1), 'J', font=font(22, True), fill=ZONE['1'][2], anchor='mm')
dr.line([(jx, jy + 22), (jx, jy + 60)], fill=ZONE['1'][2], width=14)
dr.text((jx, jy + 78), 'Entry Shaft (copy the map) ← corridor vent', font=font(14, True), fill=INK, anchor='mm')
ex, ey = ctr(*G['exit'])
stack = ['Fan Room', 'Exit → Airlock Bay']
dr.line([(ex, ey - 22), (ex, ey - 70 - 46 * (len(stack) - 1))], fill=ZONE['3'][2], width=14)
for i, nm in enumerate(stack):
    yy = ey - 70 - i * 46
    dr.rounded_rectangle([ex - 80, yy - 16, ex + 80, yy + 16], 8, fill=(255, 255, 255), outline=ZONE['3'][2], width=3)
    dr.text((ex, yy), nm, font=font(14, True), fill=INK, anchor='mm')

# the Gas Chamber, on the door into the Gut
(gx0, gy0), (gx1, gy1) = [ctr(*c) for c in G['gas_chamber']]
gcy = (gy0 + gy1) // 2
dr.rounded_rectangle([gx0 - 24, gcy - 13, gx0 + 24, gcy + 13], 6, fill=(255, 255, 255), outline=(120, 120, 40), width=3)
dr.text((gx0, gcy + 1), 'GAS', font=font(12, True), fill=(120, 120, 40), anchor='mm')
# gates

# the border: the Queen's back wall, the only way into the Purge Core
(bx0, by0), (bx1, by1) = [ctr(*c) for c in G['gates']['border']]
BORDER = (170, 120, 20)
dr.line([(bx0, by0 - 22), (bx1, by1 + 18)], fill=BORDER, width=10)
dr.rounded_rectangle([bx0 + 14, (by0 + by1) // 2 - 11, bx0 + 86, (by0 + by1) // 2 + 11], 5, fill=BORDER)
dr.text((bx0 + 50, (by0 + by1) // 2), 'BORDER', font=font(11, True), fill=(255, 255, 255), anchor='mm')
# shortcuts
(vx0, vy0), (vx1, vy1) = [ctr(*c) for c in G['shortcuts']['heart_valve']]
dr.line([(vx0 + 18, vy0), (vx1 - 18, vy1)], fill=SHORT, width=6)
dr.ellipse([(vx0 + vx1) // 2 - 13, vy0 - 13, (vx0 + vx1) // 2 + 13, vy0 + 13], fill=(255, 255, 255), outline=SHORT, width=4)
dr.text(((vx0 + vx1) // 2, vy0 + 1), 'V', font=font(15, True), fill=SHORT, anchor='mm')
(sx0, sy0), (sx1, sy1) = [ctr(*c) for c in G['shortcuts']['vertical_shaft']]
pts = [(sx0 + 22, sy0), (sx0 + 30, sy0), (sx0 + 30, sy1 + 30), (sx1 + 24, sy1 + 30)] if sx1 <= sx0 else [(sx0 + 22, sy0), (sx1 + 30, sy0), (sx1 + 30, sy1 + 24)]
for p, q in zip(pts, pts[1:]): dr.line([p, q], fill=SHORT, width=4)
lx, ly = pts[-1]
dr.polygon([(lx - 8, ly + 2), (lx + 8, ly + 2), (lx, ly - 10)] if pts[-1][1] < pts[-2][1] else [(lx - 2, ly - 8), (lx - 2, ly + 8), (lx - 14, ly)], fill=SHORT)

# the Mimic
mmx, mmy = ctr(*G['npcs']['mimic'])
dr.ellipse([mmx - 15, mmy - 15, mmx + 15, mmy + 15], fill=(200, 40, 40), outline=(255, 255, 255), width=2)
dr.text((mmx, mmy + 1), '?', font=font(18, True), fill=(255, 255, 255), anchor='mm')
for side, loop in G['patrols'].items():
    lx, ly = ctr(*min(loop, key=lambda c: (-c[1], c[0])))
    dr.rounded_rectangle([lx - 20, ly - 44, lx + 20, ly - 26], 5, fill=PATROL)
    dr.text((lx, ly - 35), 'W' + ('1' if side == 'w' else '2'), font=font(12, True), fill=(255, 255, 255), anchor='mm')
# coordinates
for x in range(W):
    dr.text((ML + x * S + S // 2, MT + ROWS * S + 6), str(x), font=font(11), fill=QUIET, anchor='mt')

# title + key
st = G['stats']
dr.text((ML - 10, 22), 'Vent maze v6: The Colony, a sample layout', font=font(26, True), fill=INK)
dr.text((ML - 10, 58), f"{st['screens']} screens ({st['screens_by_zone']['1']} / {st['screens_by_zone']['2']} / {st['screens_by_zone']['3']}) · main route {st['route_moves']} moves "
        f"({st['route_moves_by_zone']['1']} / {st['route_moves_by_zone']['2']} / {st['route_moves_by_zone']['3']} by zone) · "
        f"{st['with_valve']} with the Heart Valve · {st['with_shaft']} with the Vertical Shaft · "
        f"{st['folds_by_zone']['2']} cold folds, {st['breathing_by_zone']['2']} + {st['breathing_by_zone']['3']} breathing ducts", font=font(15), fill=QUIET)
px, py = ML + W * S + 70, MT - 40
def key_row(y, draw_icon, text):
    draw_icon(px + 16, y); dr.text((px + 44, y), text, font=font(14), fill=INK, anchor='lm')
for z in ('1', '2', '3'):
    name, band, col = ZONE[z]
    key_row(py, lambda x, y, c=col: dr.rounded_rectangle([x - 12, y - 12, x + 12, y + 12], 5, fill=c), f'{z} · {name}'); py += 34
key_row(py, lambda x, y: [dr.line([(x - 14, y), (x - 8, y)], fill=(90, 90, 90), width=4), dr.line([(x - 2, y), (x + 4, y)], fill=(90, 90, 90), width=4), dr.line([(x + 10, y), (x + 14, y)], fill=(90, 90, 90), width=4)], 'way through with air (white dashes)'); py += 34
key_row(py, lambda x, y: (dr.rounded_rectangle([x - 12, y - 12, x + 12, y + 12], 5, fill=(150, 52, 44)), dr.line([(x - 9, y + 8), (x + 9, y + 8)], fill=(255, 255, 255), width=3)), 'sealed behind (the lip): no way south'); py += 34
key_row(py, lambda x, y: (dr.rounded_rectangle([x - 12, y - 12, x + 12, y + 12], 5, fill=(30, 26, 24)), dr.text((x, y + 1), '☠', font=font(18), fill=(255, 255, 255), anchor='mm')), 'purge duct (deadly; skull on the map)'); py += 34
key_row(py, lambda x, y: dr.ellipse([x - 14, y - 14, x + 14, y + 14], outline=(30, 26, 24), width=3), 'breathing duct (Gut): out-breath blows you back'); py += 34
key_row(py, lambda x, y: dr.ellipse([x - 14, y - 14, x + 14, y + 14], outline=(200, 30, 30), width=3), 'breathing duct (Core): out-breath kills'); py += 34
key_row(py, lambda x, y: dr.ellipse([x - 9, y - 9, x + 9, y + 9], fill=AIR), 'cold fold: breathe (refill to 8) and hide'); py += 34
key_row(py, lambda x, y: [dr.line([(x + k, y - 12), (x + k, y + 12)], fill=(30, 26, 24), width=3) for k in (-8, 0, 8)], 'grate: the Curator can reach in here'); py += 34
key_row(py, lambda x, y: dr.rounded_rectangle([x - 16, y - 9, x + 16, y + 9], 4, fill=(170, 120, 20)), "the border: the Queen's wall into the Core"); py += 34
key_row(py, lambda x, y: dr.ellipse([x - 8, y - 8, x + 8, y + 8], fill=AIR), 'dot by a room: it has air (refill to 8)'); py += 34
key_row(py, lambda x, y: dr.line([(x - 14, y), (x + 14, y)], fill=SHORT, width=5), 'shortcut (V = Heart Valve; arrow = drop-hole)'); py += 34
key_row(py, lambda x, y: dr.line([(x - 14, y), (x + 14, y)], fill=PATROL, width=12), 'Warden patrol loop (W1, W2) on the game clock'); py += 34
key_row(py, lambda x, y: (dr.ellipse([x - 13, y - 13, x + 13, y + 13], fill=(200, 40, 40)), dr.text((x, y + 1), '?', font=font(15, True), fill=(255, 255, 255), anchor='mm')), 'the Mimic (bad): a voice in a dead end'); py += 44
for k in ('warren', 'lever', 'collapsed', 'vera', 'chapel', 'hollow', 'camp', 'nursery', 'cache', 'seam', 'grate'):
    z = '1' if k in ('lever', 'collapsed') else '2' if k in ('warren', 'vera', 'chapel', 'hollow', 'camp', 'nursery') else '3'
    key_row(py, lambda x, y, k=k, c=ZONE[z][2]: (dr.rounded_rectangle([x - 13, y - 13, x + 13, y + 13], 6, fill=(255, 255, 255), outline=c, width=3), dr.text((x, y + 1), LETTER[k], font=font(15, True), fill=c, anchor='mm')), NAME[k]); py += 32
py += 10
key_row(py, lambda x, y: dr.text((x, y), 'J', font=font(18, True), fill=ZONE['1'][2], anchor='mm'), 'Junction (the way in)'); py += 30
key_row(py, lambda x, y: (dr.rounded_rectangle([x - 16, y - 11, x + 16, y + 11], 5, fill=(255, 255, 255), outline=(120, 120, 40), width=3), dr.text((x, y + 1), 'GAS', font=font(9, True), fill=(120, 120, 40), anchor='mm')), 'Gas Chamber: the helmet gets you through,'); py += 20
dr.text((px + 44, py), 'then the Warren tears it off. Locked until the lever.', font=font(14), fill=INK, anchor='lm'); py += 30
dr.text((px, py + 14), 'North is up. Each square is one screen. Numbers in a', font=font(13), fill=QUIET)
dr.text((px, py + 32), 'room are its levels: 1 opens from the duct, 2 lies behind 1.', font=font(13), fill=QUIET)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
im.save(OUT)
print('wrote', OUT, im.size)
