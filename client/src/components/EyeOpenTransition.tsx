import { useState, useEffect, type CSSProperties } from 'react';

interface EyeOpenTransitionProps {
  active: boolean;
  onComplete?: () => void;
}

const PHASE_DELAY_MS = 100;
const LID_DURATION_MS = 2800;
const BLUR_DURATION_MS = 1800;
const VIGNETTE_DURATION_MS = 4000;

const KEYFRAMES = `
@keyframes eye-lid-top {
  0% { transform: translateY(0); }
  8% { transform: translateY(2vh); }
  15% { transform: translateY(1vh); }
  100% { transform: translateY(-55vh); }
}
@keyframes eye-lid-bottom {
  0% { transform: translateY(0); }
  8% { transform: translateY(-2vh); }
  15% { transform: translateY(-1vh); }
  100% { transform: translateY(55vh); }
}
`;

let eyeStylesInjected = false;

export function EyeOpenTransition({ active, onComplete }: EyeOpenTransitionProps) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');

  useEffect(() => {
    if (!eyeStylesInjected) {
      eyeStylesInjected = true;
      const el = document.createElement('style');
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    const t1 = setTimeout(() => setPhase('opening'), PHASE_DELAY_MS);
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, PHASE_DELAY_MS + LID_DURATION_MS + 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, onComplete]);

  if (!active && phase === 'done') return null;
  if (phase === 'done') return null;

  const isOpening = phase === 'opening';

  const lidBase: CSSProperties = {
    position: 'fixed',
    left: 0,
    width: '100vw',
    height: '55vh',
    backgroundColor: '#000',
    zIndex: 901,
    pointerEvents: 'none',
  };

  const topLid: CSSProperties = {
    ...lidBase,
    top: 0,
    borderBottomLeftRadius: '50% 40px',
    borderBottomRightRadius: '50% 40px',
    ...(isOpening
      ? {
          animation: `eye-lid-top ${LID_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
        }
      : {}),
  };

  const bottomLid: CSSProperties = {
    ...lidBase,
    bottom: 0,
    borderTopLeftRadius: '50% 40px',
    borderTopRightRadius: '50% 40px',
    ...(isOpening
      ? {
          animation: `eye-lid-bottom ${LID_DURATION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`,
        }
      : {}),
  };

  const lidEdgeShadow: CSSProperties = {
    position: 'fixed',
    left: 0,
    width: '100vw',
    height: '100vh',
    top: 0,
    pointerEvents: 'none',
    zIndex: 902,
    boxShadow: 'inset 0 0 120px 60px rgba(0,0,0,0.7)',
    opacity: isOpening ? 0 : 1,
    transition: `opacity ${VIGNETTE_DURATION_MS}ms ease-out`,
  };

  const blurOverlay: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backdropFilter: isOpening ? 'blur(0px)' : 'blur(6px)',
    WebkitBackdropFilter: isOpening ? 'blur(0px)' : 'blur(6px)',
    transition: `backdrop-filter ${BLUR_DURATION_MS}ms ease-out, -webkit-backdrop-filter ${BLUR_DURATION_MS}ms ease-out`,
    pointerEvents: 'none',
    zIndex: 900,
  };

  return (
    <>
      <div style={topLid}>
        {/* Eyelash/membrane detail along bottom edge */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: '10%',
            width: '80%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, #1a1a10 20%, #2a2018 50%, #1a1a10 80%, transparent 100%)',
            borderRadius: '0 0 50% 50%',
          }}
        />
      </div>
      <div style={bottomLid}>
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '10%',
            width: '80%',
            height: '4px',
            background: 'linear-gradient(90deg, transparent 0%, #1a1a10 20%, #2a2018 50%, #1a1a10 80%, transparent 100%)',
            borderRadius: '50% 50% 0 0',
          }}
        />
      </div>
      <div style={blurOverlay} />
      <div style={lidEdgeShadow} />
    </>
  );
}
