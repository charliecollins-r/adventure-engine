"""The pilot tuning his helmet radio (the opening's first pose): the owner's Gemini frame on blue
(intro/sprites/raw/eva_tune_raw.webp), keyed, despilled and trimmed into intro/sprites/eva_tune.png.
build_intro_v2.py reads its size and scales it to the float sprite's height."""
from PIL import Image
import numpy as np

src = Image.open('intro/sprites/raw/eva_tune_raw.webp').convert('RGB')
x = np.array(src).astype(np.float32)
r, g, b = x[..., 0], x[..., 1], x[..., 2]
blueness = b - np.maximum(r, g)                       # how much bluer than anything else
alpha = np.clip(1 - (blueness - 60) / 70, 0, 1)        # >130 bluer = background, <60 = subject, soft edge between
# despill: pull blue down to the other channels where the edge is tinted
spill = np.clip(blueness, 0, None) * (alpha > 0)
x[..., 2] = np.where(blueness > 0, np.maximum(r, g) + np.minimum(spill, 10), b)
rgba = np.dstack([np.clip(x, 0, 255), alpha * 255]).astype(np.uint8)
im = Image.fromarray(rgba, 'RGBA')
bbox = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
im = im.crop(bbox)
im.save('intro/sprites/eva_tune.png')
print('eva_tune.png', im.size)
