/**
 * Every sound the game starts, in one place, so leaving a game (Main menu, Restart, a new scenario) can cut it all
 * at once: room ambience, music, voices, one-shot sounds, cinematic tracks and Web Audio filters.
 *
 * It watches HTMLMediaElement.play() (installed once at startup), so no component has to remember to register.
 * `closeGate()` also refuses any sound a stray timer from the old game tries to start after the cut, until
 * `openGate()` (a game mounting).
 */
const playing = new Set<HTMLMediaElement>();
const contexts = new Set<AudioContext>();
let gateOpen = true;
let installed = false;

export function installAudioBus(): void {
  if (installed || typeof HTMLMediaElement === 'undefined') return;
  installed = true;
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (!gateOpen) return Promise.resolve();
    playing.add(this);
    this.addEventListener('ended', () => playing.delete(this), { once: true });
    return play.call(this);
  };
}

/** A Web Audio context (radio and helmet-mic filters): closed by stopAllAudio. */
export function trackAudioContext(ctx: AudioContext): AudioContext {
  contexts.add(ctx);
  return ctx;
}

/** Cut every sound now. `oneShotsOnly`: leave looping tracks (ambience, music) alone, e.g. on Undo. */
export function stopAllAudio(opts: { oneShotsOnly?: boolean } = {}): void {
  for (const a of [...playing]) {
    if (opts.oneShotsOnly && a.loop) continue;
    try { a.pause(); a.currentTime = 0; } catch { /* already gone */ }
    playing.delete(a);
  }
  if (opts.oneShotsOnly) return;
  for (const c of contexts) c.close().catch(() => {});
  contexts.clear();
}

export function closeGate(): void { gateOpen = false; }
export function openGate(): void { gateOpen = true; }
/** For tests: how many tracked sounds are still playing. */
export function playingCount(): number { return [...playing].filter((a) => !a.paused).length; }
/** For tests: the file names of the tracked sounds still playing. */
export function playingSources(): string[] { return [...playing].filter((a) => !a.paused).map((a) => a.src.split('/').pop() ?? ''); }
