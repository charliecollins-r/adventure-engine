"""Master the intro's audio to consistent loudness, so voices sit clearly above effects and music.

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
for f in sorted(glob.glob('intro/audio/*.mp3')):
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
