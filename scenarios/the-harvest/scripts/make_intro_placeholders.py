"""Procedural stand-in audio for the intro cinematic (setting.intro_scenes), until the ElevenLabs clips arrive.

    cd scenarios/the-harvest && python3 scripts/make_intro_placeholders.py      # needs NumPy and ffmpeg

Writes intro/audio/music_intro.mp3, music_dread.mp3, sting_dread.mp3 and the sfx_*.mp3 clips that do not exist yet (real audio is never overwritten;
pass --force to regenerate every stand-in).
Deterministic (seeded).
"""
import os, subprocess, sys, tempfile, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(11)

def t(sec): return np.arange(int(sec * SR)) / SR
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(sec): return rng.normal(size=int(sec * SR))
def write(path, x, br='128k'):
    if os.path.exists(path) and '--force' not in sys.argv: return
    x = np.clip(x / (np.abs(x).max() + 1e-9) * 0.8, -1, 1)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: tmp = f.name
    w = wave.open(tmp, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-b:a', br, path], check=True); os.remove(tmp)
def add(x, i, b):
    m = max(0, min(len(b), len(x) - i)); x[i:i + m] += b[:m]
def ramp(n, a, b): return np.linspace(a, b, n)
def thump(sec, f0=55, decay=9):
    tt = t(sec); return np.sin(2 * np.pi * (f0 - 20 * tt) * tt) * np.exp(-tt * decay)

def music_intro():  # 0-20 s lonely pad, 20-35 unease, 35-50 dread swell, hard stop, tail
    dur = 55; tt = t(dur); x = np.zeros_like(tt)
    for i, f in enumerate([110, 164.8, 220, 277.2, 329.6]):
        x += np.sin(2 * np.pi * f * (1 + 0.002 * i) * tt + i) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.06 * tt + i))
    x *= 0.18
    detune = np.clip((tt - 20) / 15, 0, 1)
    x += 0.15 * detune * np.sin(2 * np.pi * (65.4 + 3 * np.sin(2 * np.pi * 0.2 * tt)) * tt)       # dissonant low note
    dread = np.clip((tt - 35) / 15, 0, 1) ** 2
    x += 0.5 * dread * (np.sin(2 * np.pi * 41.2 * tt) + 0.6 * np.sin(2 * np.pi * 43.6 * tt) + 0.3 * band(noise(dur), 40, 300))
    s = 22.0
    while s < 50:
        rate = 50 + (s - 22) * 3
        for off, a in ((0, 1.0), (0.2, 0.6)):
            i = int((s + off) * SR); add(x, i, 0.35 * a * min(1, (s - 22) / 8) * thump(0.35))
        s += 60 / rate
    x[int(50 * SR):] *= np.exp(-np.arange(len(x) - int(50 * SR)) / SR * 6)  # hard stop + tail
    return x

def breath_loop():
    dur = 10; tt = t(dur); env = np.maximum(0, np.sin(2 * np.pi * tt / 5)) ** 2 + 0.5 * np.maximum(0, -np.sin(2 * np.pi * tt / 5)) ** 2
    return band(noise(dur), 300, 2500) * env + 0.15 * band(noise(dur), 3000, 8000)
def swell():
    dur = 10; tt = t(dur); e = np.clip(tt / 8, 0, 1) ** 2 * np.exp(-np.maximum(0, tt - 8.5) * 3)
    groan = np.sin(2 * np.pi * (38 + 6 * np.sin(2 * np.pi * 0.3 * tt)) * tt) + 0.5 * band(noise(dur), 60, 400)
    return groan * e
def taken():
    dur = 10; tt = t(dur); hum = np.sin(2 * np.pi * (90 + 40 * tt / dur) * tt) * 0.5 + 0.3 * np.sin(2 * np.pi * (181 + 80 * tt / dur) * tt)
    tear = band(noise(dur), 200, 4000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 1.3 * tt) > 0.6))
    x = (hum + tear) * np.clip(tt / 2, 0, 1); x[int(9.6 * SR):] = 0; return x
def heartbeat_fast():
    dur = 6; x = np.zeros(int(dur * SR)); s = 0.0
    while s < dur - 0.4:
        for off, a in ((0, 1.0), (0.16, 0.65)):
            i = int((s + off) * SR); add(x, i, a * thump(0.25, 60, 12))
        s += 0.42
    return x
def scan():
    dur = 8; tt = t(dur); x = 0.2 * np.sin(2 * np.pi * (800 + 400 * np.sin(2 * np.pi * 0.25 * tt)) * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * tt))
    for s in np.arange(0.2, dur, 0.37):
        if rng.random() < 0.7:
            i = int(s * SR); n = int(0.04 * SR); add(x, i, band(noise(0.04), 1500, 6000)[:n] * np.hanning(n))
    return x + 0.15 * np.sin(2 * np.pi * 70 * tt) * band(noise(dur), 50, 200)
def underwater():
    dur = 10; tt = t(dur); x = 0.4 * band(noise(dur), 30, 250)
    for s in np.arange(0.3, dur - 0.5, 1.1):
        for off, a in ((0, 1.0), (0.22, 0.6)):
            i = int((s + off) * SR); add(x, i, 0.8 * a * thump(0.3, 45, 10))
    for s in rng.uniform(0, dur - 0.2, 14):
        i = int(s * SR); bt = t(0.12); add(x, i, 0.12 * np.sin(2 * np.pi * (400 + 900 * bt) * bt) * np.exp(-bt * 30))
    return x
def glass_crack():
    dur = 4; x = np.zeros(int(dur * SR))
    for s in (0.1, 0.5, 0.65, 1.2):
        i = int(s * SR); n = int(0.08 * SR); x[i:i + n] += band(noise(0.08), 2000, 9000)[:n] * np.exp(-np.arange(n) / SR * 40)
    i = int(1.4 * SR); m = len(x) - i; add(x, i, 0.3 * band(noise(4), 300, 3000)[:m] * np.linspace(0, 1, m))
    return x

def dread_sting():  # the ship revealed: a heavy hit and a screeching dissonant cluster that hangs and dies
    dur = 6.5; tt = t(dur); n = len(tt)
    hit = np.sin(2 * np.pi * (46 - 14 * tt) * tt) * np.exp(-tt * 2.2) + 0.6 * band(noise(dur), 40, 500) * np.exp(-tt * 5)
    cluster = np.zeros(n)
    for f in (98, 103.8, 146.8, 155.6, 207.7, 220):            # minor seconds stacked: no consonance anywhere
        trem = 0.75 + 0.25 * np.sin(2 * np.pi * (7 + f % 3) * tt)
        cluster += np.sin(2 * np.pi * f * tt + f) * trem
    cluster *= np.minimum(1, tt / 0.04) * np.exp(-tt * 0.45) / 6
    screech = band(noise(dur), 2400, 5200) * np.exp(-tt * 1.4) * np.minimum(1, tt / 0.3) * 0.25
    return hit + 0.9 * cluster + screech
def music_dread():  # under the ship and the abduction: a low beating cluster, a slow throb, distant groans; loopable
    dur = 40; tt = t(dur)
    x = sum(np.sin(2 * np.pi * f * tt + i) for i, f in enumerate((41.2, 43.65, 55, 58.27))) / 4
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * tt) ** 2                    # a slow throb
    x += 0.35 * band(noise(dur), 30, 160) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * tt))
    for s0 in (6.0, 19.0, 31.0):                                         # distant metal groans
        i = int(s0 * SR); g = t(4.0)
        add(x, i, 0.25 * np.sin(2 * np.pi * (70 + 25 * np.sin(2 * np.pi * 0.4 * g)) * g) * np.sin(np.pi * g / 4.0))
    n = 3 * SR; r = np.linspace(0, 1, n); y = x[:-n].copy(); y[:n] = x[:n] * r + x[-n:] * (1 - r)   # seamless loop
    return y

os.makedirs('intro/audio', exist_ok=True)
write('intro/audio/music_intro.mp3', music_intro(), '96k')
for name, fn in [('sfx_breath_loop', breath_loop), ('sfx_swell', swell), ('sfx_taken', taken), ('sfx_heartbeat_fast', heartbeat_fast),
                 ('sfx_scan', scan), ('sfx_underwater', underwater), ('sfx_glass_crack', glass_crack),
                 ('sting_dread', dread_sting), ('music_dread', music_dread)]:
    write(f'intro/audio/{name}.mp3', fn())
print('intro placeholder audio written')
