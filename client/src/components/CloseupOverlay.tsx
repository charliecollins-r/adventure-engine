import { useEffect, useCallback, type CSSProperties } from 'react';

interface CloseupOverlayProps {
  imageSrc: string;
  onClose: () => void;
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500,
    cursor: 'pointer',
    animation: 'closeup-fade-in 0.3s ease-out',
  },
  frame: {
    position: 'relative',
    maxWidth: '720px',
    maxHeight: '80vh',
    border: '3px solid #3a2a18',
    borderRadius: '4px',
    boxShadow: '0 0 40px rgba(192, 160, 48, 0.15), 0 8px 32px rgba(0, 0, 0, 0.6)',
    overflow: 'hidden',
    animation: 'closeup-scale-in 0.3s ease-out',
  },
  image: {
    display: 'block',
    width: '100%',
    height: 'auto',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
  closeHint: {
    position: 'absolute',
    bottom: '8px',
    right: '10px',
    fontSize: '11px',
    fontFamily: 'monospace',
    color: 'rgba(192, 160, 48, 0.5)',
    pointerEvents: 'none',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
  },
};

const KEYFRAMES = `
@keyframes closeup-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes closeup-scale-in {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
`;

let closeupStylesInjected = false;

export function CloseupOverlay({ imageSrc, onClose }: CloseupOverlayProps) {
  useEffect(() => {
    if (!closeupStylesInjected) {
      closeupStylesInjected = true;
      const el = document.createElement('style');
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={styles.frame}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Close-up view"
          style={styles.image}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div style={styles.closeHint}>click anywhere to close</div>
      </div>
    </div>
  );
}
