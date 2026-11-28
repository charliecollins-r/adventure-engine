"""The pilot's helmet radio on the spacewalk: easy-listening rock he plays while he works, and the same song
crackling out into static as the stars go out (the first shot of the abduction cutscene).

Source: intro/audio/source/radio_rock.mp3 if it exists (now "rock music loop" by Prime45, freesound.org/s/470766, CC0); otherwise a
synthesised stand-in song is written there first (never overwriting a real one: a .placeholder marker sits beside it).

Outputs (both through a small-helmet-speaker filter, loudness-matched under the voices):
  intro/audio/radio_rock.mp3      a seamless loop for the spacewalk and the panel close-up (view music)
  intro/audio/radio_rock_out.mp3  ~12 s: the song for ~3.5 s, then dropouts and crackle growing until it is all static,
                                  which fades out by ~11 s (timed to the stars dying in the cutscene's first shot)

Run from scenarios/the-harvest: python3 scripts/make_radio_rock.py
"""
import os
import subprocess

import numpy as np

SR = 44100
SRC = 'intro/audio/source/radio_rock.mp3'
LOOP = 'intro/audio/radio_rock.mp3'
OUT = 'intro/audio/radio_rock_out.mp3'
TARGET = -21.0   # LUFS: played at the music volume (0.28) it sits well under the voices, like a radio in the helmet


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    pcm = (np.stack([x, x], 1) * 32767).astype(np.int16).tobytes() if x.ndim == 1 else (x * 32767).astype(np.int16).tobytes()
    import wave
    w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm); w.close()


def read(path):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.int16).astype(np.float32) / 32768


# ── the stand-in song: 96 bpm, a lazy I-V-vi-IV in E, kick/snare/hats, picked bass, a crunchy rhythm guitar ──────────
def stand_in():
    rng = np.random.default_rng(7)
    bpm = 96; beat = 60 / bpm; bars = 8; n = int(SR * beat * 4 * bars)
    t = np.arange(n) / SR
    out = np.zeros(n)
    chords = [(40, [52, 56, 59]), (47, [59, 63, 66]), (49, [61, 64, 68]), (45, [57, 61, 64])]   # E, B, C#m, A (midi)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)

    def env(length, a=0.005, d=0.25):
        k = np.arange(int(SR * length)) / SR
        return np.minimum(1, k / a) * np.exp(-k / d)

    def put(sig, at):
        i = int(at * SR); j = min(n, i + len(sig)); out[i:j] += sig[: j - i]

    for bar in range(bars):
        root, tri = chords[bar % 4]
        b0 = bar * 4 * beat
        for k in range(4):   # drums
            at = b0 + k * beat
            kk = np.arange(int(SR * 0.35)) / SR
            if k in (0, 2):
                put(0.9 * np.sin(2 * np.pi * (55 + 90 * np.exp(-kk * 30)) * kk) * np.exp(-kk * 9), at)
            if k in (1, 3):
                put(0.45 * rng.standard_normal(len(kk)) * np.exp(-kk * 14) + 0.25 * np.sin(2 * np.pi * 190 * kk) * np.exp(-kk * 18), at)
            for h in (0, 0.5):
                hh = np.arange(int(SR * 0.06)) / SR
                put(0.12 * rng.standard_normal(len(hh)) * np.exp(-hh * 60), at + h * beat)
        for k in range(8):   # bass, eighth notes
            at = b0 + k * beat / 2
            e = env(beat / 2 * 0.95, 0.004, 0.18)
            kk = np.arange(len(e)) / SR
            note = root - 12 + (7 if k in (3, 7) else 0)
            put(0.35 * np.tanh(2.2 * np.sin(2 * np.pi * hz(note) * kk)) * e, at)
        for k, dur in ((0, 1.5), (1.5, 1.0), (2.5, 1.5)):   # guitar: a lazy strum pattern
            at = b0 + k * beat
            e = env(dur * beat, 0.01, 0.6)
            kk = np.arange(len(e)) / SR
            g = sum(np.sin(2 * np.pi * hz(m) * kk + i) + 0.5 * np.sin(2 * np.pi * 2 * hz(m) * kk) for i, m in enumerate(tri))
            put(0.16 * np.tanh(2.5 * g) * e, at + 0.012 * rng.random())
    out /= np.max(np.abs(out)) * 1.1
    return out


def master(x, path, target=TARGET):
    tmp = path + '.tmp.wav'
    write_wav(tmp, x)
    probe = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    import re
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', probe)[-1])
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', f'volume={target - measured:.2f}dB,alimiter=limit=0.89:level=false',
                    '-b:a', '160k', path], check=True)
    os.remove(tmp)
    print(f'{path}: {measured:6.1f} -> {target} LUFS')


def helmet(x):
    """A small speaker inside a helmet: no lows, no air, a little boxy, a little compressed."""
    tmp_in, tmp_out = '/tmp/_radio_in.wav', '/tmp/_radio_out.wav'
    write_wav(tmp_in, x)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp_in, '-af',
                    'highpass=f=320,lowpass=f=3600,equalizer=f=1400:t=q:w=1.2:g=4,acompressor=threshold=-20dB:ratio=3:attack=10:release=200',
                    tmp_out], check=True)
    return read(tmp_out)


def crackle_out(x):
    """The song for ~3.5 s, then dropouts and crackle growing until it is static, fading out by ~11 s."""
    rng = np.random.default_rng(3)
    n = int(SR * 12)
    song = np.tile(x, int(np.ceil(n / len(x))))[:n] if len(x) < n else x[:n]
    t = np.arange(n) / SR
    decay = np.clip((t - 3.5) / 4.5, 0, 1)          # 0 until 3.5 s, 1 by 8 s
    # dropouts: the signal cuts in and out in short bursts, more and more often
    gate = np.ones(n)
    i = int(3.5 * SR)
    while i < n:
        d = decay[i]
        gap = int(SR * rng.uniform(0.03, 0.12 + 0.3 * d))
        if rng.random() < 0.15 + 0.8 * d:
            gate[i:i + gap] = rng.uniform(0, 0.3 * (1 - d))
        i += gap + int(SR * rng.uniform(0.03, 0.04 + 0.4 * (1 - d)))
    smooth = np.convolve(gate, np.ones(220) / 220, mode='same')
    static = rng.standard_normal(n) * 0.35
    static = np.convolve(static, [0.25, 0.5, 0.25], mode='same')
    pops = (rng.random(n) < 0.0008 + 0.004 * decay) * rng.standard_normal(n) * 2.0
    mix = song * smooth * (1 - 0.85 * decay) + static * (0.05 + 0.7 * decay) + pops * (0.2 + decay)
    fade = np.clip((11.0 - t) / 3.0, 0, 1)          # all static from ~8 s, gone by 11 s
    return helmet(mix * fade)


def main():
    os.makedirs(os.path.dirname(SRC), exist_ok=True)
    marker = SRC + '.placeholder'
    if not os.path.exists(SRC) or os.path.exists(marker):
        x = stand_in()
        tmp = '/tmp/_radio_song.wav'; write_wav(tmp, x)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-b:a', '192k', SRC], check=True)
        open(marker, 'w').write('synthesised stand-in: replace radio_rock.mp3 with a real track and delete this file\n')
        print('wrote stand-in song', SRC)
    song = read(SRC)
    radio = helmet(song)
    # a real track is expected to be a loop already (the current one is Prime45's "rock music loop"); only the stand-in
    # needs its end crossfaded into its start
    if os.path.exists(marker):
        m = int(1.5 * SR); ramp = np.linspace(0, 1, m)
        loop = radio[:-m].copy(); loop[:m] = radio[:m] * ramp + radio[-m:] * (1 - ramp)
    else:
        loop = radio
    master(loop, LOOP)
    # the crackle-out picks the song up a little way in (not from its very start)
    start = int(min(len(song) * 0.25, 20 * SR))
    master(crackle_out(song[start:]), OUT, TARGET + 2)


if __name__ == '__main__':
    main()
