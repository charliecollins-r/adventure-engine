import sys, random, math
from PIL import Image, ImageDraw, ImageFilter
random.seed(7319)
W,H=1200,960
CELLS={'ENTRY':((2,0),'N'),'J':((2,1),'WES'),'A':((1,1),'NE'),'B':((1,2),'NWS'),'C':((0,2),'NE'),'D':((0,3),'ES'),'E':((1,3),'NWS'),'F':((1,4),'NES'),'GAS':((1,5),'NS'),'FAN':((1,6),'NS'),'EXIT':((1,7),'S'),'G':((3,1),'NW'),'H':((3,2),'NES'),'I':((4,2),'NW'),'COLL':((4,3),'S'),'K':((3,3),'NWS'),'L':((3,4),'S'),'M':((2,3),'NE'),'N':((2,4),'WS')}
ROUTE=['ENTRY','J','A','B','E','F','GAS','FAN','EXIT']
def P(c): (x,y),_=CELLS[c]; return (190+x*205, 860-y*108)
# rusted metal plate: multi-scale value noise + brushed streaks + bevel + rivets
import numpy as np
rng=np.random.default_rng(7319)
def noise(scale):
    g=rng.random((H//scale+2,W//scale+2)).astype(np.float32)
    return np.array(Image.fromarray((g*255).astype(np.uint8)).resize((W,H),Image.BICUBIC),dtype=np.float32)/255
n=0.5*noise(160)+0.3*noise(40)+0.2*noise(8)
streak=np.array(Image.fromarray((rng.random((H,W//6))*255).astype(np.uint8)).resize((W,H),Image.BILINEAR),dtype=np.float32)/255
base=np.array([62,36,30],dtype=np.float32); rust=np.array([128,62,30],dtype=np.float32)
t=np.clip((n-0.45)*2.2,0,1)[...,None]
img=base*(1-t)+rust*t
img*= (0.85+0.25*streak[...,None])
img+= (rng.random((H,W,1))*10-5)
im=Image.fromarray(np.clip(img,0,255).astype(np.uint8)); d=ImageDraw.Draw(im)
d.rectangle([14,14,W-15,H-15],outline=(28,14,11),width=10); d.rectangle([24,24,W-25,H-25],outline=(120,76,58),width=2)
for rx,ry in [(48,48),(W-48,48),(48,H-48),(W-48,H-48),(W//2,40),(W//2,H-40)]:
    d.ellipse([rx-11,ry-11,rx+11,ry+11],fill=(70,44,36),outline=(24,12,10),width=3); d.ellipse([rx-6,ry-7,rx+2,ry-1],fill=(150,110,90))
def scratch(a,b,w=3,jit=4,col=(226,196,160)):
    for k in range(3):
        off=(k-1)*w*1.6
        pts=[]
        for t in [i/14 for i in range(15)]:
            x=a[0]+(b[0]-a[0])*t; y=a[1]+(b[1]-a[1])*t
            dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy) or 1
            nx,ny=-dy/L,dx/L
            j=random.uniform(-jit,jit)
            pts.append((x+nx*(off+j),y+ny*(off+j)))
        d.line([(p[0]+2,p[1]+2) for p in pts],fill=(30,14,10),width=w)
        d.line(pts,fill=col,width=w-1 if w>2 else w)
D={'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0)}
pos={v[0]:k for k,v in CELLS.items()}
done=set()
for c,((x,y),o) in CELLS.items():
    for ch in o:
        n=pos.get((x+D[ch][0],y+D[ch][1]))
        if n and frozenset((c,n)) not in done:
            done.add(frozenset((c,n))); scratch(P(c),P(n))
# entry stub to corridor
ex,ey=P('ENTRY'); scratch((ex,ey),(ex,ey+70))
for c in CELLS:
    x,y=P(c); r=16
    d.ellipse([x-r,y-r,x+r,y+r],fill=(40,20,16),outline=(30,14,10),width=6); d.ellipse([x-r,y-r,x+r,y+r],outline=(226,196,160),width=3)
def skull(x,y,s=34):
    d.ellipse([x-s,y-s*1.1,x+s,y+s*0.5],outline=(240,210,170),width=5)
    for ex_ in (-s*0.4,s*0.4): d.ellipse([x+ex_-9,y-s*0.5,x+ex_+9,y-s*0.5+16],fill=(240,210,170))
    for k in (-14,0,14): d.line([(x+k,y+s*0.45),(x+k,y+s*0.85)],fill=(240,210,170),width=5)
def fan(x,y,s=34):
    d.ellipse([x-s,y-s,x+s,y+s],outline=(240,210,170),width=5)
    for a in range(5):
        t=a*2*math.pi/5; d.line([(x,y),(x+math.cos(t)*s*0.95,y+math.sin(t)*s*0.95)],fill=(240,210,170),width=6)
def cross(x,y,s=30):
    scratch((x-s,y-s),(x+s,y+s),w=4,jit=2,col=(240,120,90)); scratch((x-s,y+s),(x+s,y-s),w=4,jit=2,col=(240,120,90))
gx,gy=P('GAS'); skull(gx+70,gy)
fx,fy=P('FAN'); fan(fx+70,fy)
cx,cy=P('COLL'); cross(cx,cy-55)
xx,xy=P('EXIT'); d.rectangle([xx+50,xy-24,xx+110,xy+24],outline=(30,14,10),width=7); d.rectangle([xx+50,xy-24,xx+110,xy+24],outline=(240,210,170),width=4)
jx,jy=P('J')
for k in range(5): scratch((jx-30+k*14,jy+40),(jx-22+k*14,jy+64),w=3,jit=1)   # the junction's tally marks
lx,ly=P('L'); scratch((lx-26,ly-34),(lx+26,ly-34),w=6,jit=1,col=(240,120,90))  # dead-end gouge
# arrows along the true route
for a,b in zip(ROUTE,ROUTE[1:]):
    (x1,y1),(x2,y2)=P(a),P(b); mx,my=(x1+x2)/2,(y1+y2)/2; ang=math.atan2(y2-y1,x2-x1)
    for s_ in (2.5,-2.5):
        t=ang+math.pi+s_*0.3; scratch((mx,my),(mx+math.cos(ang+math.pi+0.5*(1 if s_>0 else -1))*30,my+math.sin(ang+math.pi+0.5*(1 if s_>0 else -1))*30),w=4,jit=1,col=(250,220,120))
# compass N
nx,ny=1100,110; scratch((nx,ny+60),(nx,ny-40),w=5,jit=1); scratch((nx,ny-40),(nx-20,ny-10),w=5,jit=1); scratch((nx,ny-40),(nx+20,ny-10),w=5,jit=1)
# vignette
v=Image.new('L',(W,H),0); vd=ImageDraw.Draw(v); vd.ellipse([-200,-160,W+200,H+160],fill=255); v=v.filter(ImageFilter.GaussianBlur(120))
im=Image.composite(im,Image.new('RGB',(W,H),(12,6,5)),v)
im.save(sys.argv[1],quality=90)
