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
    'narr_': -16, 'radio_': -20,          # the radio sits a little under the narrator
    'sfx_taken': -20, 'sfx_swell': -21, 'sfx_glass_crack': -21,
    'sfx_heartbeat_fast': -24, 'sfx_scan': -25, 'sfx_tool': -26,
    'sfx_underwater': -27, 'sfx_breath_loop': -30,
    'music_intro': -22, 'music_dread': -24, 'sting_dread': -19,
    'title_hit': -20, 'rumble': -24,
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

# The new intro's voice lines (intro/audio/v2/, script in the "First Impression" doc): originals in intro/audio/v2/source/,
# named by line id (sound effects by name). Relay Control (c*) sits 6 dB under the pilot (p*, n*: the Silas voice, -16 like the room narration).
# the new intro's sound effects, under the voices (same scale as TARGETS above)
V2_SFX = {'breath_loop': -42, 'panel': -26, 'stars_out': -22, 'harvest': -20, 'scan': -25, 'pod': -27, 'heartbeat': -24, 'glass': -21}
for src in sorted(glob.glob('intro/audio/v2/source/*.mp3')):
    name = os.path.basename(src)
    target = V2_SFX.get(name[:-4], -22 if name.startswith('c') else -16)
    if name == 'breath_loop.mp3':
        # seamless loop: the last 1.5 s crossfaded into the start
        r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '2', '-ar', '44100', '-'], capture_output=True, check=True).stdout
        x = np.frombuffer(r, np.int16).reshape(-1, 2).astype(np.float32); n = int(1.5 * 44100); ramp = np.linspace(0, 1, n)[:, None]
        lp = x[:-n].copy(); lp[:n] = x[:n] * ramp + x[-n:] * (1 - ramp)
        src = 'intro/audio/v2/source/_loop.wav'
        w = wave.open(src, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100); w.writeframes(np.clip(lp, -32768, 32767).astype(np.int16).tobytes()); w.close()
        # softened (owner: too harsh and a bit metallic against the ambient bed): the ring at 1.73 kHz (and its
        # octave) notched out, everything above ~1.4 kHz rolled off steeply and each breath's swell evened out, so it
        # sits far back under the scene as a presence, not a pulse
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af',
                        'highpass=f=150,equalizer=f=1730:t=q:w=4:g=-18,equalizer=f=3460:t=q:w=4:g=-10,lowpass=f=1400,lowpass=f=1400,acompressor=threshold=-32dB:ratio=4:attack=250:release=1200', src + '.soft.wav'], check=True)
        os.replace(src + '.soft.wav', src)
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = target - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', f'intro/audio/v2/{name}'], check=True)
    if src.endswith('_loop.wav'): os.remove(src)
    print(f'v2/{name}: {measured:6.1f} -> {target} LUFS ({gain:+.1f} dB)')

# Death sounds (audio/deaths/, one per kind of death; prompts in the "First Impression" doc): originals in
# audio/deaths/source/, mastered to -18 LUFS, a little over the room ambience, with a short fade at the end.
os.makedirs('audio/deaths/source', exist_ok=True)
for src in sorted(glob.glob('audio/deaths/source/*.mp3')):
    name = os.path.basename(src)
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = -18 - measured
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af',
                    f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false,afade=t=out:st={max(0, dur - 0.4):.2f}:d=0.4', '-b:a', '160k', f'audio/deaths/{name}'], check=True)
    print(f'deaths/{name}: {measured:6.1f} -> -18 LUFS ({gain:+.1f} dB)')

# The opening's voiced lines (intro/audio/v2/voice/: s* the pilot, w01 waking up, t* the tips; ids in build_intro_v2.py
# LINES): originals in intro/audio/v2/voice/source/, mastered to -16 LUFS like the room narration.
os.makedirs('intro/audio/v2/voice/source', exist_ok=True)
for src in sorted(glob.glob('intro/audio/v2/voice/source/*.mp3')):
    name = os.path.basename(src)
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = -16 - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', f'intro/audio/v2/voice/{name}'], check=True)
print(f'v2/voice: {len(glob.glob("intro/audio/v2/voice/source/*.mp3"))} line(s) mastered to -16 LUFS')

# Menu ambience (audio/menu/, the owner's ElevenLabs clips, ~10 s each): originals in audio/menu/source/, made into
# seamless loops (the last 2 s crossfaded into the start) and mastered to -21 LUFS, a quiet bed under the title screen.
os.makedirs('audio/menu/source', exist_ok=True)
for src in sorted(glob.glob('audio/menu/source/*.mp3')):
    name = os.path.basename(src)
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-f', 's16le', '-ac', '2', '-ar', '44100', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(r, np.int16).reshape(-1, 2).astype(np.float32); n = int(2.0 * 44100); ramp = np.linspace(0, 1, n)[:, None]
    lp = x[:-n].copy(); lp[:n] = x[:n] * ramp + x[-n:] * (1 - ramp)
    tmp = 'audio/menu/source/_loop.wav'
    w = wave.open(tmp, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(44100); w.writeframes(np.clip(lp, -32768, 32767).astype(np.int16).tobytes()); w.close()
    out = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = -21 - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', f'audio/menu/{name}'], check=True)
    os.remove(tmp)
    print(f'menu/{name}: {measured:6.1f} -> -21 LUFS ({gain:+.1f} dB), looped')

# The swap (owner's call): the title screen plays the Stargazer bed and the spacewalk plays menu clip 2, each matched to
# the loudness of the track it replaced (the menu bed at -21.4 LUFS, the spacewalk's at -27.5, played at music volume 0.28).
def match(src, dst, target):
    out = subprocess.run(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    measured = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); gain = target - measured
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:level=false', '-b:a', '160k', dst], check=True)
    print(f'{dst}: {measured:6.1f} -> {target} LUFS ({gain:+.1f} dB)')
match('intro/audio/bed_stargazer.mp3', 'audio/menu/menu_stargazer.mp3', -21.4)
match('audio/menu/menu_ambience_2.mp3', 'intro/audio/bed_space_ambience.mp3', -27.5)
