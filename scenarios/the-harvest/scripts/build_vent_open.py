"""Make sprites/vent_cover_open.png: the corridor floor grate slid aside, with the shaft glowing red below.

    cd scenarios/the-harvest && python3 scripts/build_vent_open.py

Built from sprites/vent_cover.png, so it always matches the closed grate. The hole keeps the closed grate's
footprint at the same place relative to the sprite's bottom edge; the canvas is wider on the left, where the
grate now lies, so the open sprite's anchor sits SHIFT_X screen px left of the closed one's (see the scenario).
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

grate = Image.open('sprites/vent_cover.png').convert('RGBA')
W, H = grate.size
EXTRA = 520                        # room on the left for the slid-aside grate
canvas = Image.new('RGBA', (W + EXTRA, H + 30), (0, 0, 0, 0))

# the hole: the grate's own footprint, filled with depth (dark rim, red glow at the bottom of the shaft)
mask = grate.getchannel('A').point(lambda v: 255 if v > 30 else 0).filter(ImageFilter.MinFilter(9))
yy, xx = np.mgrid[0:H, 0:W]
cx, cy = W / 2, H * 0.58
r = np.sqrt(((xx - cx) / (W * 0.5)) ** 2 + ((yy - cy) / (H * 0.5)) ** 2)
glow = np.clip(1 - r, 0, 1) ** 1.6
rgb = np.zeros((H, W, 3))
rgb[..., 0] = 18 + 215 * glow
rgb[..., 1] = 6 + 40 * glow
rgb[..., 2] = 8 + 30 * glow
hole = Image.fromarray(rgb.astype(np.uint8), 'RGB').convert('RGBA')
hole.putalpha(mask)
# a dark lip along the top edge of the hole, so it reads as an opening in the floor
lip = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(lip).rectangle([0, 0, W, int(H * 0.22)], fill=(8, 6, 6, 200))
lip.putalpha(Image.fromarray((np.asarray(lip.getchannel('A')) * (np.asarray(mask) / 255)).astype(np.uint8)))
canvas.alpha_composite(hole, (EXTRA, 0))
canvas.alpha_composite(lip.filter(ImageFilter.GaussianBlur(14)), (EXTRA, 0))

# the grate itself, lifted and dropped to the left of the hole, a little askew, with a soft shadow
moved = grate.rotate(-7, resample=Image.BICUBIC, expand=True)
shadow = Image.new('RGBA', moved.size, (0, 0, 0, 0))
shadow.putalpha(moved.getchannel('A').point(lambda v: int(v * 0.55)))
shadow = shadow.filter(ImageFilter.GaussianBlur(10))
gx, gy = 40, 14
canvas.alpha_composite(shadow, (gx + 18, gy + 22))
canvas.alpha_composite(moved, (gx, gy))
canvas.save('sprites/vent_cover_open.png', optimize=True)
print('sprites/vent_cover_open.png', canvas.size, '| closed grate centre is', EXTRA + W / 2 - canvas.width / 2, 'px right of the open sprite centre')
