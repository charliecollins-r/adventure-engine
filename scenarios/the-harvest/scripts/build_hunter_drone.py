"""Key the hunter drone strip (4 frames side by side on blue) into sprites/hunter_drone.png.

    cd scenarios/the-harvest && python3 scripts/build_hunter_drone.py

Each frame is cut from its quarter of the strip and all four share ONE crop (in cell coordinates),
so the drone's bob between frames survives but nothing else jumps.
"""
import numpy as np
from PIL import Image

a = np.asarray(Image.open('sprites/raw/hunter_drone_strip.webp').convert('RGB')).astype(np.float32)
H, W, _ = a.shape
r, g, b = a[..., 0], a[..., 1], a[..., 2]
alpha = np.clip((150 - (b - np.maximum(r, g))) / 70, 0, 1)
out = a.copy(); out[..., 2] = np.minimum(b, np.maximum(r, g) + 12)
rgba = Image.fromarray(np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
cw = W // 4
cells = [rgba.crop((i * cw, 0, (i + 1) * cw, H)) for i in range(4)]
boxes = [c.getchannel('A').point(lambda v: 255 if v > 60 else 0).getbbox() for c in cells]
box = (min(x[0] for x in boxes), min(x[1] for x in boxes), max(x[2] for x in boxes), max(x[3] for x in boxes))
frames = [c.crop(box) for c in cells]
fw, fh = frames[0].size
sheet = Image.new('RGBA', (fw * 4, fh), (0, 0, 0, 0))
for i, f in enumerate(frames): sheet.paste(f, (i * fw, 0))
sheet.save('sprites/hunter_drone.png', optimize=True)
print(f'sprites/hunter_drone.png: 4 frames of {fw}x{fh}')
