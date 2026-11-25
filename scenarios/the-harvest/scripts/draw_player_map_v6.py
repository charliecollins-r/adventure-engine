"""Draw the escapee's map of the vent maze v6 (the player's map) and its layers, from scripts/vent_maze_v6_grid.json.

    cd scenarios/the-harvest && python3 scripts/draw_player_map_v6.py        # needs Pillow + NumPy

Writes closeups/vent_map_v6.webp (the scratched plate, north up, the Gut's east half torn off) and four transparent
layers the game draws over it (show_closeup layers):
  closeups/vent_map_v6_camp.png    the torn half, copied from the scrap at the escapee's camp (pencil)
  closeups/vent_map_v6_keth.png    the torn half, scratched in by an allied Keth-Vari (four-fingered strokes)
  closeups/vent_map_v6_false.png   false marks from an enemy Keth-Vari: wrong ducts, a "fold" that is a purge duct
  closeups/vent_map_v6_tunnels.png the two tunnels the colony opens after the Audience
No "you are here", no route: the player reads it by counting turns.
"""
import json, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
G = json.load(open(os.path.join(HERE, 'vent_maze_v6_grid.json')))
W, H = 1200, 1000
S = 58
ML, MT = (W - 15 * S) // 2, 70
D = {'N': (0, 1), 'S': (0, -1), 'E': (1, 0), 'W': (-1, 0)}
OPP = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
cells = {tuple(map(int, k.split(','))): v for k, v in G['cells'].items()}
TORN = lambda c: 3 <= c[1] <= 10 and c[0] >= G['torn_x']
rooms = {tuple(c): r for r, cs in G['rooms'].items() for c in cs}
rng = random.Random(6)


def ctr(c):
    return (ML + c[0] * S + S // 2, MT + (14 - c[1]) * S + S // 2)


def jitter(p, a=2.0):
    return (p[0] + rng.uniform(-a, a), p[1] + rng.uniform(-a, a))


def scratch(d, a, b, col, w=3, passes=2, a_j=1.6):
    for _ in range(passes):
        d.line([jitter(a, a_j), jitter(b, a_j)], fill=col, width=w)


def links(c):
    for dd, (dx, dy) in D.items():
        n = (c[0] + dx, c[1] + dy)
        if dd in cells[c] and n in cells and OPP[dd] in cells[n]:
            yield dd, n


def draw_cell_marks(d, c, col, w=3):
    x, y = ctr(c)
    if c in rooms:
        d.rectangle([x - 12, y - 12, x + 12, y + 12], outline=col, width=w)
    if list(c) in G['folds'] or tuple(c) in {tuple(f) for f in G['folds']}:
        d.ellipse([x + 8, y - 20, x + 20, y - 8], outline=col, width=2)
    if tuple(c) in {tuple(f) for f in G['breathing']}:
        d.ellipse([x - 11, y - 11, x + 11, y + 11], outline=col, width=2)
    if tuple(c) in {tuple(f) for f in G['grates']}:
        for o in (-6, -2, 2, 6):
            d.line([(x + o, y - 8), (x + o, y + 8)], fill=col, width=2)


def skull(d, c, col):
    x, y = ctr(c)
    d.ellipse([x - 7, y - 9, x + 7, y + 4], outline=col, width=2)
    d.point([(x - 3, y - 3), (x + 3, y - 3)], fill=col)
    d.line([(x - 4, y + 6), (x + 4, y + 6)], fill=col, width=2)


def plate():
    rnd = np.random.default_rng(3)
    base = np.zeros((H, W, 3), np.float32)
    base[...] = (54, 50, 47)
    base += rnd.normal(0, 7, (H, W, 1))
    for _ in range(500):  # brushed scratches
        y = rnd.integers(0, H); x0 = rnd.integers(0, W); ln = rnd.integers(20, 220)
        base[y:y + 1, x0:x0 + ln] += rnd.uniform(4, 16)
    img = Image.fromarray(np.clip(base, 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))
    d = ImageDraw.Draw(img)
    d.rectangle([8, 8, W - 9, H - 9], outline=(30, 27, 25), width=6)
    for x, y in ((24, 24), (W - 24, 24), (24, H - 24), (W - 24, H - 24)):
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(80, 74, 68), outline=(25, 22, 20))
    return img


INK = (205, 196, 182)
img = plate()
d = ImageDraw.Draw(img)
# the torn-off half: a jagged rip, the plate bent and blackened there
x0, y0 = ML + G['torn_x'] * S - 6, MT + (14 - 10) * S - 8
x1, y1 = ML + 15 * S + 14, MT + (14 - 3) * S + S + 8
rip = [(x0, y0)]
yy = y0
while yy < y1:
    yy += rng.uniform(14, 30)
    rip.append((x0 + rng.uniform(-10, 10), min(yy, y1)))
d.polygon(rip + [(x1, y1), (x1, y0)], fill=(26, 24, 23))
d.line(rip, fill=(120, 110, 100), width=2)
# zone lines and words
for c in cells:
    if TORN(c):
        continue
    for dd, n in links(c):
        if dd in 'NE' and not TORN(n):
            scratch(d, ctr(c), ctr(n), INK, 4)
for c in cells:
    if TORN(c):
        continue
    draw_cell_marks(d, c, INK)
for c in G['purge']:
    if not TORN(tuple(c)):
        skull(d, tuple(c), (220, 120, 90))
# the gas chamber, the junction and the heart, as she marked them
gx, gy = ctr(tuple(G['gas_chamber'][0]))
for i in range(6):
    d.arc([gx - 16 + i, gy - 16, gx + 16 + i, gy + 16], 200, 340, fill=(170, 200, 90), width=2)
jx, jy = ctr(tuple(G['junction']))
for i in range(5):
    d.line([(jx - 14 + i * 7, jy + 18), (jx - 14 + i * 7, jy + 30)], fill=INK, width=2)
hx, hy = ctr(tuple(G['exit']))
for a in range(0, 360, 72):
    r = np.radians(a)
    d.line([(hx, hy), (hx + 16 * np.cos(r), hy + 16 * np.sin(r))], fill=(230, 150, 90), width=3)
d.text((ML, MT - 46), 'N', fill=INK)
d.line([(ML + 4, MT - 30), (ML + 4, MT - 12)], fill=INK, width=2)
img.save(os.path.join(ROOT, 'closeups/vent_map_v6.webp'), quality=88)


def layer(draw_fn, name):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(lay))
    lay.save(os.path.join(ROOT, 'closeups', name))


def torn_true(col, claw=False):
    def f(dl):
        for c in cells:
            if not TORN(c):
                continue
            for dd, n in links(c):
                if dd in 'NESW' and (TORN(n) or dd in 'NE'):
                    a, b = ctr(c), ctr(n)
                    if claw:
                        for k in (-3, 0, 3):
                            scratch(dl, (a[0] + k, a[1] + k), (b[0] + k, b[1] + k), col, 1, 1, 1.2)
                    else:
                        scratch(dl, a, b, col, 3, 1, 1.0)
            draw_cell_marks(dl, c, col, 2)
        for c in G['purge']:
            if TORN(tuple(c)):
                skull(dl, tuple(c), col)
    return f


layer(torn_true((150, 160, 175, 255)), 'vent_map_v6_camp.png')
layer(torn_true((240, 200, 140, 255), claw=True), 'vent_map_v6_keth.png')


def false_marks(dl):
    col = (240, 200, 140, 255)
    torn_cells = [c for c in cells if TORN(c)]
    r = random.Random(13)
    for c in torn_cells:
        for dd in r.sample(list('NE'), 1):
            n = (c[0] + D[dd][0], c[1] + D[dd][1])
            if TORN(n):
                for k in (-3, 0, 3):
                    scratch(dl, (ctr(c)[0] + k, ctr(c)[1] + k), (ctr(n)[0] + k, ctr(n)[1] + k), col, 1, 1, 1.2)
    # a "fold" marked on a purge duct
    for c in G['purge']:
        if TORN(tuple(c)):
            x, y = ctr(tuple(c))
            dl.ellipse([x + 8, y - 20, x + 20, y - 8], outline=col, width=2)


layer(false_marks, 'vent_map_v6_false.png')


def tunnels(dl):
    col = (150, 230, 140, 255)
    for a, b in G['tunnels']['pairs']:
        pa, pb = ctr(tuple(a)), ctr(tuple(b))
        for k in (-3, 0, 3):
            scratch(dl, (pa[0] + k, pa[1] + k), (pb[0] + k, pb[1] + k), col, 2, 1, 1.0)


layer(tunnels, 'vent_map_v6_tunnels.png')
print('player map and layers written')
