"""Draw the rigged grappling line that spans the Stasis Hold gap.

Screen-space anchors (960x540 viewport) were measured on the painted background:
A = near torn railing stump (tie-off), B = broken railing stub on the cataloguer platform
(the hook cups it). Drawn at 2x and used with sprite scale 0.5.
Usage (from scenarios/the-harvest):
  python3 scripts/draw_rigged_line.py sprites/carcass_hook.png sprites/grappling_line_rigged.png backgrounds/act1_stasis_hold.webp /tmp/preview.png
"""
import sys
from PIL import Image, ImageDraw
SS = 2  # sprite pixels per screen pixel
box = (536, 316, 792, 444)
A = (553, 413)               # near torn railing stump (tie-off point)
B = (761, 343)
W, H = (box[2]-box[0])*SS, (box[3]-box[1])*SS
im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
def L(p): return ((p[0]-box[0])*SS, (p[1]-box[1])*SS)

hook = Image.open(sys.argv[1]).convert('RGBA').transpose(Image.FLIP_TOP_BOTTOM)
hh = 30*SS; hw = round(hook.width*hh/hook.height)
hook = hook.resize((hw, hh), Image.LANCZOS)
apex = (round(hw*0.62), round(hh*0.12))          # inner top of the inverted J
hx, hy = L(B)[0]-apex[0], L(B)[1]-apex[1]-2*SS
eye = (hx+round(hw*0.24), hy+round(hh*0.90))     # eyelet, near side, bottom

def bez(p0, c, p1, n=60):
    return [((1-t)**2*p0[0]+2*(1-t)*t*c[0]+t*t*p1[0], (1-t)**2*p0[1]+2*(1-t)*t*c[1]+t*t*p1[1]) for t in [i/n for i in range(n+1)]]
a = L(A); ctrl = ((a[0]+eye[0])/2, (a[1]+eye[1])/2+20*SS)
pts = bez(a, ctrl, eye)
d = ImageDraw.Draw(im)
d.line(pts, fill=(38, 14, 10, 255), width=6*SS, joint='curve')
d.line(pts, fill=(132, 52, 38, 255), width=4*SS, joint='curve')
d.line([(x, y-SS) for x, y in pts], fill=(178, 92, 64, 255), width=SS)
for r in (3*SS,):  # knot at the tie-off
    d.ellipse([a[0]-r, a[1]-r, a[0]+r, a[1]+r], fill=(120, 46, 34, 255), outline=(38, 14, 10, 255), width=SS)
im.alpha_composite(hook, (hx, hy))
im.save(sys.argv[2])
print('size', im.size, 'anchor screen', ((box[0]+box[2])/2, box[3]), 'json', ((box[0]+box[2])/2, round(box[3]/0.75)))
bg = Image.open(sys.argv[3]).convert('RGBA').resize((960, 540))
small = im.resize((W//SS, H//SS), Image.LANCZOS)
bg.alpha_composite(small, (box[0], box[1]))
bg.crop((500, 290, 820, 470)).resize((960, 540), Image.NEAREST).save(sys.argv[4])

# ── The line under load: sprites/grappling_line_bounce.png ─────────────────────────────────
# FRAMES frames of the same line with a person's weight on it, the dip moving from the near end to the far end.
# Played once (frame_rate = FRAMES / crossing seconds) while the player crosses, then the resting line returns.
# Also prints the weight point of each frame in 960x720 JSON coordinates: the crossing path in scenario.json
# (the traverse effect on gap_grappling_line) follows these points, so his hands/feet stay on the line.
FRAMES, DIP = 8, 22 * SS
base = bez(a, ctrl, eye, n=200)
sheet = Image.new('RGBA', (W * FRAMES, H), (0, 0, 0, 0))
path = []
for k in range(FRAMES):
    t = 0.06 + 0.88 * k / (FRAMES - 1)
    i = round(t * 200); wx, wy = base[i][0], base[i][1] + DIP
    seg = bez(a, ((a[0] + wx) / 2, (a[1] + wy) / 2 + 4 * SS), (wx, wy), 40) + bez((wx, wy), ((wx + eye[0]) / 2, (wy + eye[1]) / 2 + 4 * SS), eye, 40)[1:]
    fr = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(fr)
    dd.line(seg, fill=(38, 14, 10, 255), width=6 * SS, joint='curve')
    dd.line(seg, fill=(132, 52, 38, 255), width=4 * SS, joint='curve')
    dd.line([(x, y - SS) for x, y in seg], fill=(178, 92, 64, 255), width=SS)
    dd.ellipse([a[0] - 3 * SS, a[1] - 3 * SS, a[0] + 3 * SS, a[1] + 3 * SS], fill=(120, 46, 34, 255), outline=(38, 14, 10, 255), width=SS)
    fr.alpha_composite(hook, (hx, hy))
    sheet.alpha_composite(fr, (k * W, 0))
    sx, sy = box[0] + wx / SS, box[1] + wy / SS
    path.append([round(sx), round(sy / 0.75)])
sheet.save('sprites/grappling_line_bounce.png')
back = Image.new('RGBA', sheet.size, (0, 0, 0, 0))          # the same frames in reverse, for the way back
for k in range(FRAMES): back.paste(sheet.crop(((FRAMES - 1 - k) * W, 0, (FRAMES - k) * W, H)), (k * W, 0))
back.save('sprites/grappling_line_bounce_back.png')
print('bounce sheet', sheet.size, f'{FRAMES} frames of {W}x{H}')
print('weight path (json):', path)
