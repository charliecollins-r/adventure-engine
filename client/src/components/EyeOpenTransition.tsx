import { useState, useEffect, type CSSProperties } from 'react';

interface EyeOpenTransitionProps {
  active: boolean;
  durationMs?: number;
  /** Open halfway, flutter shut, then open fully (over the same duration). */
  blink?: boolean;
  /** Milliseconds of black before the eyes start to open. Default 200. */
  holdMs?: number;
  onComplete?: () => void;
}

const BLINK_KEYFRAMES = `@keyframes eye-blink-open {
  0% { opacity: 1; } 16% { opacity: 0.55; } 26% { opacity: 0.62; } 34% { opacity: 0.97; } 44% { opacity: 0.9; } 100% { opacity: 0; }
}`;

const DEFAULT_FADE_MS = 4000;

export function EyeOpenTransition({ active, durationMs, blink, holdMs = 200, onComplete }: EyeOpenTransitionProps) {
  const fadeDuration = durationMs ?? DEFAULT_FADE_MS;
  const [phase, setPhase] = useState<'black' | 'fading' | 'done'>('black');

  useEffect(() => {
    if (!active) return;

    const t1 = setTimeout(() => setPhase('fading'), holdMs);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, holdMs + fadeDuration + 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, fadeDuration, holdMs, onComplete]);

  if (phase === 'done') return null;

  const overlay: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    zIndex: 30,
    pointerEvents: 'none',
    opacity: phase === 'fading' ? 0 : 1,
    ...(blink
      ? (phase === 'fading' ? { animation: `eye-blink-open ${fadeDuration}ms ease-in-out forwards` } : {})
      : { transition: `opacity ${fadeDuration}ms ease-out` }),
  };

  return (
    <>
      {blink && <style>{BLINK_KEYFRAMES}</style>}
      <div data-eye-open style={overlay} />
    </>
  );
}
