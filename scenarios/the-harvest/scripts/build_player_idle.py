"""Build the player's subtle idle loop (12 columns x 2 rows, 300x410 frames).

Breathing is procedural (2px lift of head and shoulders); the head turn is transplanted from a
Gemini "look toward the camera" edit of the base frame and colour-matched. See docs/ART_GUIDE.md,
"Idle animations for the player character".

Usage (from scenarios/the-harvest):
  python3 scripts/build_player_idle.py <gemini_look.png> sprites/character_idle.png
  python3 scripts/build_helmet_sheets.py      # then rebuild the helmeted sheets from it
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
import os
SHEET = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sprites', 'character_idle.png')  # column 0 of each row is the base pose
sheet = Image.open(SHEET).convert('RGBA')
FW, FH = 300, 410

def breathe(frame, waist, lift=2):
    """Lift everything above `waist` by `lift` px, stretching the torso band so nothing tears."""
    a = np.asarray(frame).copy(); bb = frame.getbbox(); top = bb[1]
    band = a[top:waist]
    new_h = band.shape[0] + lift
    stretched = np.asarray(Image.fromarray(band).resize((FW, new_h), Image.NEAREST))
    out = a.copy(); out[top - lift:waist] = stretched
    return Image.fromarray(out)

def gemini_to_frame(path, frame):
    bx = frame.getbbox(); cw, ch = bx[2] - bx[0], bx[3] - bx[1]
    ox, oy = (1024 - cw * 3) // 2, (1024 - ch * 3) // 2
    im = Image.open(path).convert('RGB').crop((ox, oy, ox + cw * 3, oy + ch * 3)).resize((cw, ch), Image.LANCZOS)
    a = np.asarray(im).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    bg = (b > 150) & (b > r + 70) & (b > g + 70)
    edge = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    cap = np.maximum(r, g); b2 = np.where(edge & ~bg & (b > cap), cap, b)
    out = np.zeros((FH, FW, 4), np.uint8)
    out[bx[1]:bx[3], bx[0]:bx[2], 0], out[bx[1]:bx[3], bx[0]:bx[2], 1], out[bx[1]:bx[3], bx[0]:bx[2], 2] = r, g, b2
    out[bx[1]:bx[3], bx[0]:bx[2], 3] = np.where(bg, 0, 255)
    return out

def transplant(frame, gem, box):
    """Copy box from the Gemini frame onto the original, colour-matched to the original's palette."""
    o = np.asarray(frame).astype(float).copy(); g = gem.astype(float)
    x0, y0, x1, y1 = box
    om = o[y0:y1, x0:x1, 3] > 0; gm = g[y0:y1, x0:x1, 3] > 0
    for c in range(3):
        oc = o[y0:y1, x0:x1, c][om]; gc = g[y0:y1, x0:x1, c][gm]
        g[y0:y1, x0:x1, c] = (g[y0:y1, x0:x1, c] - gc.mean()) / (gc.std() + 1e-6) * oc.std() + oc.mean()
    o[y0:y1, x0:x1] = np.where(gm[..., None], np.clip(g[y0:y1, x0:x1], 0, 255), 0)
    return Image.fromarray(o.astype(np.uint8))

def build_sheets(look_path, out_idle):
    right = sheet.crop((0, 0, FW, FH)); front = sheet.crop((0, FH, FW, 2 * FH))
    rb = right.getbbox(); fb = front.getbbox()
    r_frames = {'base': right, 'breath': breathe(right, waist=262),
                'look': transplant(right, gemini_to_frame(look_path, right), (105, 122, 215, 196))}
    # The front-facing row stays still (no breath or glance frames were made for it).
    f_frames = {'base': front, 'breath': front, 'look': front}
    order = ['base', 'base', 'breath', 'base', 'base', 'breath', 'base', 'look', 'look', 'look', 'base', 'breath']
    idle = Image.new('RGBA', (FW * len(order), FH * 2))
    for col, k in enumerate(order):
        for row, frames in ((0, r_frames), (1, f_frames)):
            idle.alpha_composite(frames[k], (col * FW, row * FH))
    idle.save(out_idle)
    return len(order)

if __name__ == '__main__' and len(sys.argv) > 2:
    n = build_sheets(sys.argv[1], sys.argv[2])
    print('columns', n)
