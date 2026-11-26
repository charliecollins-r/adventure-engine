/** Real browser full screen for play (the Fullscreen API). Every call is best-effort: browsers may refuse it. */
export function enterFullscreen(): void {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  } catch { /* not allowed here: play in the window */ }
}

export function exitFullscreen(): void {
  try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch { /* ignore */ }
}

export function toggleFullscreen(): void {
  if (document.fullscreenElement) exitFullscreen(); else enterFullscreen();
}
