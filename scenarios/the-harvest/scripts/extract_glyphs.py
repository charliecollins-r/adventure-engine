"""Extract alien glyphs from painted art into uniform keypad key images.

Solution glyphs come from the specimen data plates (closeups/cataloguer_specimens.webp), so
the keys the player must press are pixel-derived from what they saw there. Decoys are drawn
procedurally in the same stroke language (the painted terminal keypad's glyphs are too small
to extract). Every glyph goes through the same mask + glow render so no key looks different. Output: ui/glyph_<name>.png (transparent, 128x128).
Usage (from scenarios/the-harvest): python3 scripts/extract_glyphs.py
"""
import numpy as np
from PIL import Image, ImageFilter

def cover_map(img, px, py):  # 960x540 viewport point -> source pixel (object-fit: cover)
    W, H = img.size; sc = max(960 / W, 540 / H)
    return (px - (960 - W * sc) / 2) / sc, (py - (540 - H * sc) / 2) / sc

plates = Image.open('closeups/cataloguer_specimens.webp').convert('RGB')
x0, y0 = cover_map(plates, 392, 446)          # centre data plate
# The plate reads fern, double curl, sprouting snake, sprouting snake (the painting's 3rd and 4th characters
# are the same snake), so three keys are traced; the code repeats the sprout key.
PLATE = {'fern': (25, 15, 60, 82), 'curl': (63, 15, 103, 82), 'sprout': (106, 15, 152, 82)}
import math, random
from PIL import ImageDraw
random.seed(7319)

def drop_border_blobs(m):
    a = (np.asarray(m) > 0).astype(np.uint8); h, w = a.shape; seen = np.zeros_like(a)
    for sy, sx in [(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)]:
        if a[sy, sx] and not seen[sy, sx]:
            stack = [(sy, sx)]; seen[sy, sx] = 1
            while stack:
                y, x = stack.pop(); a[y, x] = 0
                for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                    if 0 <= ny < h and 0 <= nx < w and a[ny, nx] and not seen[ny, nx]: seen[ny, nx] = 1; stack.append((ny, nx))
    return Image.fromarray(a * 255)

def bez(p0, p1, p2, n=24):
    return [((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]) for t in [i/n for i in range(n+1)]]
def jit(pts, j=1.6): return [(x+random.uniform(-j, j), y+random.uniform(-j, j)) for x, y in pts]
DECOYS = {   # stroke lists in a 200x260 box, same organic stroke language as the plates
  'trident': [bez((100,250),(96,150),(100,70)), bez((100,95),(60,80),(55,25)), bez((100,95),(140,80),(148,25)), bez((100,70),(104,40),(98,15)), bez((70,190),(100,180),(130,195))],
  'spiral':  [[(100+math.cos(t)*(8+t*7), 120+math.sin(t)*(8+t*7)) for t in [i*0.25 for i in range(40)]], bez((150,140),(175,200),(130,250))],
  'eyehook': [[(100+math.cos(t)*38, 85+math.sin(t)*30) for t in [i*0.2 for i in range(33)]], bez((100,115),(105,190),(60,230)), bez((60,230),(45,240),(55,250)), [(95,80),(105,90)]],
  'twinbranch': [bez((100,250),(100,170),(70,90)), bez((100,170),(130,120),(150,50)), bez((80,120),(55,115),(40,90)), bez((118,135),(145,140),(160,120)), bez((140,80),(165,75),(170,55))],
  'zigzag': [[(60, 30), (140, 80), (62, 140), (140, 200), (96, 250)], [(150, 30), (156, 36)]],   # added last so the other decoys keep their jitter
}
def draw_decoy(strokes):
    im = Image.new('RGB', (200, 260), (20, 40, 40)); d = ImageDraw.Draw(im)
    for st in strokes:
        d.line(jit(st), fill=(110, 230, 200), width=15, joint='curve')
        for x, y in (st[0], st[-1]): d.ellipse([x-7, y-7, x+7, y+7], fill=(110, 230, 200))
    return im.resize((40, 52), Image.LANCZOS)   # same source scale as the plate glyphs, then same render

def render(crop, out, up=6):
    a = np.asarray(crop.resize((crop.width * up, crop.height * up), Image.BICUBIC), dtype=np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    glow = np.clip((g - 0.55 * r - 70) / 90, 0, 1) * np.clip((g + b) / 2 / 200, 0, 1)  # teal strokes only
    m = Image.fromarray((glow * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 90 else 0)
    m = drop_border_blobs(m)
    bb = m.getbbox(); m = m.crop(bb)
    m.thumbnail((100, 100), Image.LANCZOS)
    canvas = Image.new('L', (128, 128), 0); canvas.paste(m, ((128 - m.width) // 2, (128 - m.height) // 2))
    halo = canvas.filter(ImageFilter.GaussianBlur(5))
    rgba = np.zeros((128, 128, 4), np.uint8)
    core = np.asarray(canvas, np.float32) / 255; h = np.asarray(halo, np.float32) / 255
    rgba[..., 0] = (120 * core + 40 * (1 - core)).astype(np.uint8)
    rgba[..., 1] = (255 * core + 200 * (1 - core)).astype(np.uint8)
    rgba[..., 2] = (220 * core + 170 * (1 - core)).astype(np.uint8)
    rgba[..., 3] = (np.maximum(core, h * 0.55) * 255).astype(np.uint8)
    Image.fromarray(rgba).save(out)

for name, (a, b, c, d) in PLATE.items():
    render(plates.crop((int(x0 + a) - 3, int(y0 + b) - 3, int(x0 + c) + 3, int(y0 + d) + 3)), f'ui/glyph_{name}.png')
for name, strokes in DECOYS.items():
    big = draw_decoy(strokes); pad = Image.new('RGB', (big.width + 8, big.height + 8), (20, 40, 40)); pad.paste(big, (4, 4))
    render(pad, f'ui/glyph_{name}.png')
print('wrote', len(PLATE) + len(DECOYS), 'glyphs')
