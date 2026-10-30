import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';

interface IntroSequenceProps {
  pages: string[];
  title: string;
  onComplete: () => void;
}

const HOLD_DURATION_MS = 1500;

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    transition: 'opacity 1.2s ease-out',
    userSelect: 'none',
  },
  content: {
    maxWidth: '600px',
    padding: '40px',
    textAlign: 'center',
    transition: 'opacity 0.8s ease-in-out',
  },
  title: {
    fontSize: '2.2rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    letterSpacing: '4px',
    marginBottom: '40px',
    textShadow: '0 0 20px rgba(192, 160, 48, 0.3)',
    textTransform: 'uppercase',
  },
  text: {
    fontSize: '1.05rem',
    fontFamily: '"Georgia", serif',
    color: '#a09070',
    lineHeight: '2',
    letterSpacing: '0.5px',
  },
  prompt: {
    position: 'absolute',
    bottom: '40px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#4a3a2a',
    letterSpacing: '2px',
    animation: 'intro-pulse 2s ease-in-out infinite',
  },
  skipContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  skipLabel: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3a2a1a',
    letterSpacing: '1px',
    transition: 'opacity 0.3s ease',
  },
  skipRing: {
    width: '28px',
    height: '28px',
    position: 'relative',
  },
};

const KEYFRAMES = `
@keyframes intro-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
`;

let introStylesInjected = false;

export function IntroSequence({ pages, title, onComplete }: IntroSequenceProps) {
  const [pageIndex, setPageIndex] = useState(-1);
  const [textVisible, setTextVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartRef = useRef<number | null>(null);
  const holdAnimRef = useRef<number>(0);
  const skippedRef = useRef(false);

  useEffect(() => {
    if (!introStylesInjected) {
      introStylesInjected = true;
      const el = document.createElement('style');
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageIndex(0);
      setTimeout(() => setTextVisible(true), 100);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const advance = useCallback(() => {
    if (exiting) return;

    setTextVisible(false);
    setTimeout(() => {
      const next = pageIndex + 1;
      if (next >= pages.length) {
        setExiting(true);
        setTimeout(onComplete, 1200);
      } else {
        setPageIndex(next);
        setTimeout(() => setTextVisible(true), 100);
      }
    }, 600);
  }, [pageIndex, pages.length, exiting, onComplete]);

  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    setExiting(true);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  const startHold = useCallback(() => {
    if (exiting || skippedRef.current) return;
    holdStartRef.current = performance.now();

    const tick = () => {
      if (holdStartRef.current === null) return;
      const elapsed = performance.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        holdStartRef.current = null;
        skip();
      } else {
        holdAnimRef.current = requestAnimationFrame(tick);
      }
    };
    holdAnimRef.current = requestAnimationFrame(tick);
  }, [exiting, skip]);

  const cancelHold = useCallback(() => {
    holdStartRef.current = null;
    cancelAnimationFrame(holdAnimRef.current);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(holdAnimRef.current);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      else if (e.key === ' ' || e.key === 'Enter') advance();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [advance, skip]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (holdProgress > 0.15) return;
      if (pageIndex === -1) return;
      advance();
    },
    [pageIndex, advance, holdProgress],
  );

  const showTitle = pageIndex === -1;
  const currentPage = pageIndex >= 0 && pageIndex < pages.length ? pages[pageIndex] : null;
  const holding = holdProgress > 0;

  const ringRadius = 10;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - holdProgress);

  return (
    <div
      style={{ ...styles.overlay, opacity: exiting ? 0 : 1 }}
      onClick={handleClick}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
    >
      <div style={styles.skipContainer}>
        <div style={{ ...styles.skipLabel, opacity: holding ? 0.7 : 0.4 }}>
          hold to skip
        </div>
        <div style={styles.skipRing}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle
              cx="14"
              cy="14"
              r={ringRadius}
              fill="none"
              stroke="#2a1a10"
              strokeWidth="2"
            />
            <circle
              cx="14"
              cy="14"
              r={ringRadius}
              fill="none"
              stroke={holdProgress > 0.8 ? '#c0a030' : '#6a5a3a'}
              strokeWidth="2"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              transform="rotate(-90 14 14)"
              style={{ transition: holdProgress === 0 ? 'stroke-dashoffset 0.15s ease' : 'none' }}
            />
          </svg>
        </div>
      </div>

      <div style={{ ...styles.content, opacity: showTitle || textVisible ? 1 : 0 }}>
        {showTitle && <div style={styles.title}>{title}</div>}
        {currentPage && (
          <div style={styles.text}>
            {currentPage.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < currentPage.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        )}
      </div>

      {pageIndex >= 0 && !exiting && (
        <div style={styles.prompt}>click to continue</div>
      )}
    </div>
  );
}
