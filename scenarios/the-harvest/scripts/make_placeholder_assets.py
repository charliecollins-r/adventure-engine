"""Procedural placeholder assets for The Harvest Act 1 (music, sounds, a close-up, a sprite and two icons).

These are stand-ins made from code so every feature works today. Replace any of them with generated art or audio
by overwriting the file at the same path (prompts: docs/ART_GUIDE.md and the scenario's design notes).

    cd scenarios/the-harvest && python3 scripts/make_placeholder_assets.py      # needs NumPy, Pillow and ffmpeg

Writes: audio/music_stasis.mp3, music_explore.mp3, music_ducts.mp3, sting_earth.mp3, crawl.mp3, drop_thud.mp3,
score.mp3, death_sting.mp3, patrol_skitter.mp3 (the hunter patrol coming closer); items/wedding_ring.png, items/crew_datapad.png.
Deterministic (seeded).
"""
import math, subprocess, sys, tempfile, os, wave
import numpy as np
from PIL import Image, ImageDraw

SR = 44100
rng = np.random.default_rng(7)

def write_mp3(path, x, br='128k'):
    if os.path.exists(path) and '--force' not in sys.argv: return   # never overwrite real audio
    x = np.clip(x / (np.abs(x).max() + 1e-9) * 0.8, -1, 1)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: tmp = f.name
    w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-b:a', br, path], check=True); os.remove(tmp)

def t(sec): return np.arange(int(sec * SR)) / SR
def lowpass(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > cutoff] = 0; return np.fft.irfft(X, len(x))
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def loopable(x, fade=2.0):
    n = int(fade * SR); head, tail = x[:n].copy(), x[-n:]
    r = np.linspace(0, 1, n); x = x[:-n].copy(); x[:n] = head * r + tail * (1 - r); return x
def env(n, a, d):
    e = np.ones(n); A = int(a * SR); D = int(d * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if D: e[-D:] = np.linspace(1, 0, D)
    return e
def bell(freq, dur, decay=2.5):
    tt = t(dur); return (np.sin(2 * np.pi * freq * tt) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * tt) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * tt)) * np.exp(-tt * decay) * np.minimum(1, tt * 200)
def pad(freqs, dur, lfo=0.07):
    tt = t(dur); x = np.zeros_like(tt)
    for i, f in enumerate(freqs):
        det = 1 + 0.003 * math.sin(i)
        x += np.sin(2 * np.pi * f * det * tt + i) * (0.6 + 0.4 * np.sin(2 * np.pi * lfo * tt + i * 1.3))
    return x / len(freqs)

def music_stasis():  # eerie, slow, sparse bells over a low drone (A minor-ish, unresolved)
    dur = 64; x = 0.55 * pad([55, 82.4, 110, 164.8], dur, 0.05)
    x += 0.12 * lowpass(rng.normal(size=len(x)), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.03 * t(dur)))
    notes = [440, 523.3, 659.3, 587.3, 392, 349.2, 440, 311.1]
    for k, s in enumerate(np.arange(3, dur - 6, 5.5)):
        b = bell(notes[k % len(notes)] / 2, 5); i = int(s * SR); x[i:i + len(b)] += 0.22 * b
    return loopable(lowpass(x, 5000))

def music_explore():  # a low heartbeat pulse under a dark pad
    dur = 48; tt = t(dur); x = 0.4 * pad([49, 73.4, 98, 146.8], dur, 0.04)
    beat = 60 / 54
    for s in np.arange(0, dur, beat):
        for off, amp in ((0, 1.0), (0.22, 0.6)):
            i = int((s + off) * SR); n = int(0.35 * SR)
            if i + n < len(x):
                tt2 = np.arange(n) / SR; x[i:i + n] += 0.5 * amp * np.sin(2 * np.pi * (52 - 20 * tt2) * tt2) * np.exp(-tt2 * 14)
    x += 0.06 * bandpass(rng.normal(size=len(x)), 2000, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt))
    return loopable(lowpass(x, 6000))

def music_ducts():  # tense: a slowly beating low cluster, ticking metal, rising and falling hiss
    dur = 40; tt = t(dur); x = 0.5 * pad([41.2, 43.7, 61.7, 82.4], dur, 0.13)
    for s in np.arange(0.3, dur, 0.75):
        if rng.random() < 0.6:
            b = bell(1800 + rng.random() * 900, 0.12, 40); i = int(s * SR); x[i:i + len(b)] += 0.05 * b
    x += 0.1 * bandpass(rng.normal(size=len(x)), 300, 3000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 0.05 * tt) ** 2))
    return loopable(lowpass(x, 7000))

def sting_earth():  # a swelling, bittersweet chord: home, and too late
    dur = 9; x = pad([130.8, 196, 261.6, 329.6, 392], dur, 0.2) * env(int(dur * SR), 3, 3)
    b = bell(523.3, 6, 1.2); i = int(2.5 * SR); x[i:i + len(b)] += 0.25 * b
    return lowpass(x, 6000)

def crawl():  # a soft scuff of cloth and knees on ribbed metal
    dur = 0.9; n = int(dur * SR); x = np.zeros(n)
    for s, amp in ((0.0, 1.0), (0.35, 0.8)):
        i = int(s * SR); m = int(0.3 * SR)
        x[i:i + m] += amp * bandpass(rng.normal(size=m), 400, 3500) * np.hanning(m)
    k = bell(220, 0.4, 18); x[int(0.38 * SR):int(0.38 * SR) + len(k)] += 0.25 * k
    return x
def drop_thud():
    n = int(0.8 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (70 - 30 * tt) * tt) * np.exp(-tt * 7) + 0.3 * bandpass(rng.normal(size=n), 100, 900) * np.exp(-tt * 18)
def death_sting():  # a death: a heavy low hit, then a dissonant cluster sliding down into silence
    dur = 4.5; tt = t(dur); n = len(tt)
    hit = np.sin(2 * np.pi * (48 - 18 * tt) * tt) * np.exp(-tt * 3.2) + 0.5 * bandpass(rng.normal(size=n), 60, 700) * np.exp(-tt * 9)
    cluster = sum(np.sin(2 * np.pi * f * (1 - 0.07 * tt) * tt) for f in (220, 233.1, 311.1, 329.6)) / 4
    cluster *= np.minimum(1, tt / 0.15) * np.exp(-tt * 0.9) * 0.45
    return lowpass(hit + cluster, 4000)
def score():
    a, b = bell(784, 0.7, 4), bell(1046.5, 0.9, 3.5); x = np.zeros(int(1.2 * SR)); x[:len(a)] += a; i = int(0.12 * SR); x[i:i + len(b)] += b; return x

def patrol_skitter():  # the cataloguer patrol coming closer: many metal feet ticking, a servo whine, getting louder
    dur = 3.6; tt = t(dur); n = len(tt); x = np.zeros(n)
    pos = 0.0
    while pos < dur - 0.05:  # leg ticks at an uneven gallop, quickening
        i = int(pos * SR); m = min(int(0.03 * SR), n - i); k = np.arange(m) / SR
        tick = bandpass(rng.normal(size=m), 1800, 6500) * np.exp(-k * 260) + 0.6 * np.sin(2 * np.pi * rng.uniform(2200, 3400) * k) * np.exp(-k * 180)
        x[i:i + m] += tick * rng.uniform(0.5, 1.0)
        pos += rng.choice([0.055, 0.07, 0.09, 0.12]) * (1 - 0.35 * pos / dur)
    whine = np.sin(2 * np.pi * (520 + 90 * np.sin(2 * np.pi * 1.7 * tt)) * tt) * 0.12 + np.sin(2 * np.pi * 1040 * tt) * 0.04
    x = x * 0.9 + whine * (0.4 + 0.6 * tt / dur)
    return lowpass(x * (0.25 + 0.75 * (tt / dur) ** 1.4) * np.minimum(1, (dur - tt) / 0.15), 9000)

os.makedirs('audio', exist_ok=True)
for name, fn in [('patrol_skitter', patrol_skitter), ('music_stasis', music_stasis), ('music_explore', music_explore), ('music_ducts', music_ducts), ('sting_earth', sting_earth),
                 ('crawl', crawl), ('drop_thud', drop_thud), ('score', score), ('death_sting', death_sting)]:
    write_mp3(f'audio/{name}.mp3', fn(), '96k' if name.startswith('music') else '128k')

# ── Item icons on the standard 326x273 canvas (pixel art, scaled up 5x) ───────────────────────
def icon(draw_fn, path):
    small = Image.new('RGBA', (64, 54), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(small))
    big = small.resize((320, 270), Image.NEAREST); canvas = Image.new('RGBA', (326, 273), (0, 0, 0, 0)); canvas.paste(big, (3, 1), big); canvas.save(path)
def ring(dr):
    dr.ellipse([16, 12, 48, 44], outline=(60, 40, 10, 255), width=8); dr.ellipse([17, 13, 47, 43], outline=(214, 170, 60, 255), width=6)
    dr.arc([19, 15, 45, 41], 200, 290, fill=(255, 236, 160, 255), width=2)
def datapad(dr):
    dr.rounded_rectangle([12, 6, 52, 48], radius=4, fill=(52, 58, 62, 255), outline=(20, 22, 24, 255), width=2)
    dr.rectangle([17, 11, 47, 38], fill=(14, 60, 58, 255))
    for yy in (15, 20, 25, 30): dr.line([(20, yy), (20 + (yy * 7) % 22 + 6, yy)], fill=(110, 230, 200, 255), width=1)
    dr.rectangle([28, 41, 36, 44], fill=(90, 96, 100, 255)); dr.line([(46, 8), (51, 13)], fill=(150, 40, 40, 255), width=2)
icon(ring, 'items/wedding_ring.png'); icon(datapad, 'items/crew_datapad.png')
print('placeholder assets written')
