import { useState, useEffect, type CSSProperties } from 'react';

interface EyeOpenTransitionProps {
  active: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

const DEFAULT_FADE_MS = 4000;

export function EyeOpenTransition({ active, durationMs, onComplete }: EyeOpenTransitionProps) {
  const fadeDuration = durationMs ?? DEFAULT_FADE_MS;
  const [phase, setPhase] = useState<'black' | 'fading' | 'done'>('black');

  useEffect(() => {
    if (!active) return;

    const t1 = setTimeout(() => setPhase('fading'), 200);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 200 + fadeDuration + 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, fadeDuration, onComplete]);

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
    transition: `opacity ${fadeDuration}ms ease-out`,
  };

  return <div style={overlay} />;
}
