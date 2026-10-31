import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';

interface IntroSequenceProps {
  pages: string[];
  title: string;
  onComplete: () => void;
}

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
  bottomPrompts: {
    position: 'absolute',
    bottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  prompt: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#4a3a2a',
    letterSpacing: '2px',
    animation: 'intro-pulse 2s ease-in-out infinite',
  },
  skipLink: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3a2a1a',
    letterSpacing: '1px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: '4px 12px',
    transition: 'color 0.2s ease',
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
      const target = e.target as HTMLElement;
      if (target.closest('[data-skip-intro]')) return;
      if (pageIndex === -1) return;
      advance();
    },
    [pageIndex, advance],
  );

  const showTitle = pageIndex === -1;
  const currentPage = pageIndex >= 0 && pageIndex < pages.length ? pages[pageIndex] : null;

  return (
    <div
      style={{ ...styles.overlay, opacity: exiting ? 0 : 1 }}
      onClick={handleClick}
    >
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
        <div style={styles.bottomPrompts}>
          <div style={styles.prompt}>click to continue</div>
          <button
            data-skip-intro
            style={styles.skipLink}
            onClick={skip}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#6a5a3a'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#3a2a1a'; }}
          >
            skip intro
          </button>
        </div>
      )}
    </div>
  );
}
