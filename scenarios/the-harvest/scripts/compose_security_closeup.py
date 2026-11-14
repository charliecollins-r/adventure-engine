"""Build closeups/security_closeup.webp from existing art (no new painting needed).

Backdrop: the wall of screens behind the console in backgrounds/act1_security_hub.webp, cropped, blurred
and darkened. Foreground: closeups/security_console.webp chroma-keyed (tools/process-chromakey-sprite.mjs
--cols 1 --padding 0 --threshold 110) and laid across the bottom of the frame with a soft drop shadow.

Usage (from scenarios/the-harvest):
  convert closeups/security_console.webp /tmp/console.png
  node ../../tools/process-chromakey-sprite.mjs /tmp/console.png --cols 1 --padding 0 --threshold 110 --out /tmp/console_keyed.png
  python3 scripts/compose_security_closeup.py backgrounds/act1_security_hub.webp /tmp/console_keyed.png closeups/security_closeup.webp
"""
import sys
from PIL import Image, ImageEnhance, ImageFilter
hub_p, console_p, out_p = sys.argv[1:4]
hub = Image.open(hub_p).convert('RGB')
box = (420, 110, 1340, 627)                       # behind-the-console region of the hub painting
bg = hub.crop(box).resize((1920, 1080), Image.LANCZOS)
bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(2.2))).enhance(0.72).convert('RGBA')
con = Image.open(console_p).convert('RGBA')
con = con.crop(con.getbbox())
w = 1780; h = round(con.height * w / con.width)
con = con.resize((w, h), Image.LANCZOS)
x = (1920 - w) // 2; y = 1080 - h + 40
sh = Image.new('RGBA', bg.size, (0, 0, 0, 0))
shadow = Image.new('RGBA', con.size, (0, 0, 0, 150)); shadow.putalpha(con.getchannel('A').point(lambda a: 150 if a > 40 else 0))
sh.alpha_composite(shadow, (x + 10, y + 26)); sh = sh.filter(ImageFilter.GaussianBlur(14))
bg.alpha_composite(sh); bg.alpha_composite(con, (x, y))
bg.convert('RGB').save(out_p, quality=90)
print('console at', x, y, w, h)
