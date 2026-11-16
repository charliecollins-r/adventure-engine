"""Master the intro's audio (and the in-game narration in audio/voice/) to consistent loudness, so voices sit
clearly above effects, ambience and music.

    cd scenarios/the-harvest && python3 scripts/master_intro_audio.py     # needs ffmpeg

The untouched originals live in intro/audio/source/ (copied there on the first run); the mastered files
in intro/audio/ are rebuilt from them every run, so this is safe to repeat after replacing a source clip.
Each clip is measured (EBU R128 integrated loudness) and gained to its target, with a limiter on peaks.
In the player, voices then play at full volume, music and loops are ducked further while a voice speaks.
"""
import glob, os, re, shutil, subprocess

# integrated loudness targets (LUFS): voices on top, events below, beds well below
TARGETS = {
    'narr_': -16, 'radio_': -17,
    'sfx_taken': -20, 'sfx_swell': -21, 'sfx_glass_crack': -21,
    'sfx_heartbeat_fast': -24, 'sfx_scan': -25, 'sfx_tool': -26,
    'sfx_underwater': -27, 'sfx_breath_loop': -30,
    'music_intro': -22,
}
os.makedirs('intro/audio/source', exist_ok=True)

# The intro's ambient bed: "Stargazer" (audio/ambient_vastness.wav, credits in the README), made seamlessly loopable
# (the last 6 s crossfaded into the start) and mastered quiet, well under the voices.
BED_SRC, BED = 'audio/ambient_vastness.wav', 'intro/audio/bed_stargazer.mp3'
import numpy as np, wave
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', BED_SRC, '-f', 's16le', '-ac', '2', '-ar', '44100', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32)
n = 6 * 44100                                   # crossfade the last 6 s into the first 6 s
ramp = np.linspace(0, 1, n)[:, None]
loop = x[:-n].copy(); loop[:n] = x[:n] * ramp + x[-n:] * (1 - ramp)
tmp = 'intro/audio/source/_bed.wav'
w = wave.open(tmp, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100); w.writeframes(np.clip(loop, -32768, 32767).astype(np.int16).tobytes()); w.close()
out = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
g = -27 - float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', f'volume={g:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', BED], check=True)
os.remove(tmp); print(f'{BED}: looped, -27 LUFS')
for f in sorted(x for x in glob.glob('intro/audio/*.mp3') if not x.endswith('bed_stargazer.mp3')):
    name = os.path.basename(f)
    src = f'intro/audio/source/{name}'
    if not os.path.exists(src): shutil.copy(f, src)
    target = next((v for k, v in TARGETS.items() if name.startswith(k)), None)
    if target is None: print(f'{name}: no target, left as is'); continue
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
    gain = target - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false',
                    '-b:a', '160k', f], check=True)
    print(f'{name}: {measured:6.1f} -> {target} LUFS ({gain:+.1f} dB)')

# In-game narration (audio/voice/*.mp3): the same treatment, originals kept in audio/voice/source/.
os.makedirs('audio/voice/source', exist_ok=True)
for f in sorted(glob.glob('audio/voice/*.mp3')):
    name = os.path.basename(f); src = f'audio/voice/source/{name}'
    if not os.path.exists(src): shutil.copy(f, src)
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = -16 - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', f], check=True)
    print(f'voice/{name}: {measured:6.1f} -> -16 LUFS ({gain:+.1f} dB)')
