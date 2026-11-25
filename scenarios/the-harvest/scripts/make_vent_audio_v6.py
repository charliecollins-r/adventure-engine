"""Stand-in sounds and music for the vent maze v6, synthesised from code (replace any by overwriting the same path).

    cd scenarios/the-harvest && python3 scripts/make_vent_audio_v6.py      # needs NumPy and ffmpeg; never overwrites (use --force)

Writes audio/vents/*.mp3 (the lung breathing, throats, the cough and heartbeat, Warden clicks, the surge, the Curator's
hum, the colony knocking, the Queen's long and short breaths, listening, the lever, the membrane, the bellows stopping,
the Queen) and audio/music_gut.mp3, music_core.mp3, music_court.mp3. Deterministic (seeded).
"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_placeholder_assets import write_mp3, t, lowpass, bandpass, loopable, env, bell, SR

rng = np.random.default_rng(66)
OUT = 'audio/vents'
os.makedirs(OUT, exist_ok=True)
noise = lambda sec: rng.standard_normal(int(sec * SR))


def breath(sec, lo, hi, rise=0.4, fall=0.5):
    x = bandpass(noise(sec), lo, hi)
    return x * env(len(x), sec * rise, sec * fall)


def clicks(sec, rate, pitch=3200, far=False):
    x = np.zeros(int(sec * SR))
    k = 0.0
    while k < sec - 0.05:
        n = int(k * SR)
        c = bandpass(noise(0.02), pitch * 0.7, pitch * 1.4) * np.exp(-np.arange(int(0.02 * SR)) / (0.003 * SR))
        x[n:n + len(c)] += c
        k += 1 / rate * (0.6 + 0.8 * rng.random())
    if far: x = lowpass(x, 1200) * 0.5
    return x


def hum(sec, f0=55, wander=6):
    tt = t(sec)
    f = f0 + wander * np.sin(2 * np.pi * 0.3 * tt) + 2 * np.sin(2 * np.pi * 1.7 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3.01 * ph)) * env(len(tt), 0.4, 0.8)


sounds = {
    'lung_in': breath(2.2, 150, 900, 0.7, 0.3) * 0.7,
    'lung_out': breath(2.0, 80, 600, 0.2, 0.7) * 0.6,
    'throat_gulp': np.concatenate([breath(0.5, 200, 1500, 0.2, 0.3), lowpass(noise(0.25), 200) * env(int(0.25 * SR), 0.01, 0.2)]),
    'vent_scald': breath(1.2, 400, 6000, 0.05, 0.6) + lowpass(noise(1.2), 120) * 0.6,
    'cough': np.concatenate([breath(0.18, 300, 2500, 0.05, 0.6), np.zeros(int(0.08 * SR)), breath(0.15, 300, 2500, 0.05, 0.6)]),
    'heartbeat': np.concatenate([np.concatenate([lowpass(noise(0.12), 90) * env(int(0.12 * SR), 0.005, 0.1), np.zeros(int(0.12 * SR)),
                                                 lowpass(noise(0.1), 80) * env(int(0.1 * SR), 0.005, 0.08), np.zeros(int(0.5 * SR))]) for _ in range(3)]),
    'warden_click': clicks(1.6, 9),
    'warden_click_far': clicks(1.6, 9, far=True),
    'surge_roar': lowpass(noise(5.0), 180) * env(int(5 * SR), 2.5, 1.5) + bandpass(noise(5.0), 300, 1200) * 0.3 * env(int(5 * SR), 3.5, 1.0),
    'surge_far': lowpass(noise(4.0), 120) * env(int(4 * SR), 1.5, 1.5) * 0.5,
    'curator_hum': hum(3.0),
    'colony_knock': np.concatenate([lowpass(noise(0.06), 400) * env(int(0.06 * SR), 0.002, 0.05) * (0.4 + 0.6 * rng.random()) if i % 3 else np.zeros(int(0.11 * SR)) for i in range(40)]),
    'breath_long': breath(1.1, 120, 1400, 0.3, 0.4),
    'breath_short': breath(0.4, 160, 1600, 0.2, 0.5),
    'listen': breath(0.9, 80, 500, 0.6, 0.4) * 0.4,
    'lever': np.concatenate([bandpass(noise(0.7), 200, 2000) * env(int(0.7 * SR), 0.05, 0.3), lowpass(noise(1.2), 150) * env(int(1.2 * SR), 0.005, 1.0) * 1.5]),
    'membrane_tear': bandpass(noise(1.4), 300, 3000) * env(int(1.4 * SR), 0.4, 0.3) + lowpass(noise(1.4), 200) * 0.5,
    'bellows_stop': np.concatenate([lowpass(noise(1.5), 250) * np.linspace(1, 0.2, int(1.5 * SR)), breath(2.5, 60, 400, 0.1, 0.9)]),
    'queen': hum(4.0, f0=48, wander=3) * 0.6 + breath(4.0, 100, 700, 0.5, 0.5),
}
for name, x in sounds.items():
    write_mp3(f'{OUT}/{name}.mp3', x)


def drone(sec, base, layers, wet=0.3, choir=False):
    tt = t(sec)
    x = np.zeros_like(tt)
    for i, f in enumerate(layers):
        x += np.sin(2 * np.pi * base * f * tt + i) * (0.6 / (i + 1)) * (1 + 0.3 * np.sin(2 * np.pi * (0.05 + 0.02 * i) * tt))
    x += lowpass(noise(sec), 300) * wet
    if choir:
        x += sum(np.sin(2 * np.pi * base * r * tt) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.1 * tt + r)) for r in (2, 2.5, 3))
    return loopable(x * env(len(tt), 2, 0), 3)


g = drone(48, 55, [1, 1.5, 2.02])
write_mp3('audio/music_gut.mp3', g + clicks(48, 0.7, far=True)[:len(g)] * 0.3)
write_mp3('audio/music_core.mp3', drone(40, 46, [1, 1.06, 2.0], wet=0.5))
write_mp3('audio/music_court.mp3', drone(48, 49, [1, 1.5, 2.0], wet=0.2, choir=True))
print('vent audio written (existing files kept)')
