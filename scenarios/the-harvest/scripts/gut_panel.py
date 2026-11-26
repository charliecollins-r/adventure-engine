"""Paint the panel's insides out: the story says every board is gone, but both panel paintings show green boards.
Writes intro/backgrounds/intro_panel_gutted.webp from intro_panel_empty.webp (the door-less painting the close-up
uses): the board area becomes a dark, empty backplane with bare slot rails, scraped contacts and one cut cable.

    cd scenarios/the-harvest && python3 scripts/gut_panel.py
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SRC, OUT = 'intro/backgrounds/intro_panel_empty.webp', 'intro/backgrounds/intro_panel_gutted.webp'
im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
green = (g > r + 25) & (g > b - 10) & (g > 60)
green[:, :700] = False
green = ndimage.binary_closing(green, iterations=6)
lab, n = ndimage.label(green)
green = lab == (np.argmax(ndimage.sum(green, lab, range(1, n + 1))) + 1)
ys, xs = np.where(green)
x0, x1, y0, y1 = xs.min() - 8, xs.max() + 8, ys.min() - 10, ys.max() + 10
W, H = x1 - x0, y1 - y0

rng = np.random.default_rng(7)
cav = Image.new('RGB', (W, H))
d = ImageDraw.Draw(cav)
for yy in range(H):                                  # a dark cavity, a little lighter at the top where the sun gets in
    t = yy / H
    d.line([(0, yy), (W, yy)], fill=(int(22 - 12 * t), int(30 - 16 * t), int(36 - 18 * t)))
cols = [(14, W // 2 - 8), (W // 2 + 8, W - 14)]
rows = 5
for c0, c1 in cols:
    d.rectangle([c0 - 5, 8, c0 - 2, H - 8], fill=(58, 64, 70))       # card guides
    d.rectangle([c1 + 2, 8, c1 + 5, H - 8], fill=(58, 64, 70))
    for k in range(rows):
        yy = 22 + k * (H - 40) // rows
        d.rectangle([c0, yy, c1, yy + 9], fill=(34, 40, 46), outline=(70, 78, 86))   # an empty edge connector
        for px in range(c0 + 5, c1 - 4, 6):
            if rng.random() > 0.25:
                d.rectangle([px, yy + 3, px + 2, yy + 6], fill=(150, 120, 60))       # contacts, a few scraped off
        d.line([(c0, yy + 14), (c1, yy + 14)], fill=(26, 31, 36))
for _ in range(9):                                   # scrape marks
    sx, sy = rng.integers(10, W - 30), rng.integers(10, H - 10)
    d.line([(sx, sy), (sx + rng.integers(10, 30), sy + rng.integers(-3, 4))], fill=(92, 98, 104), width=1)
cx = int(W * 0.62)                                   # one cut cable hanging from the top
d.line([(cx, 0), (cx + 6, 40), (cx + 2, 78)], fill=(150, 40, 30), width=5)
d.line([(cx + 1, 76), (cx + 4, 84)], fill=(200, 170, 110), width=2)
cav = cav.filter(ImageFilter.GaussianBlur(0.9))
noise = rng.normal(0, 4, (H, W, 1))
cav = Image.fromarray(np.clip(np.asarray(cav).astype(float) + noise, 0, 255).astype(np.uint8))
# soft edge, and the frame's own shadow over the top and left of the cavity
mask = Image.new('L', (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([3, 3, W - 4, H - 4], radius=14, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(3))
shade = Image.new('L', (W, H), 0)
sd = ImageDraw.Draw(shade)
for i in range(18):
    sd.rectangle([0, 0, W, 18 - i], fill=int(110 * (1 - i / 18)))
    sd.rectangle([0, 0, 18 - i, H], fill=int(110 * (1 - i / 18)))
cav = Image.composite(Image.new('RGB', (W, H), (0, 0, 0)), cav, shade)
out = im.copy()
out.paste(cav, (x0, y0), mask)
out.save(OUT, quality=92)
print(OUT, (x0, y0, x1, y1))
