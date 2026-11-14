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
