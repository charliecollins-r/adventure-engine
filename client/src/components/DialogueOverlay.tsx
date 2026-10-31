import { useState, type CSSProperties } from 'react';
import type { DialogueChoice } from '../engine/types';

interface DialogueOverlayProps {
  prompt: string;
  choices: DialogueChoice[];
  onSelect: (index: number) => void;
}

export function DialogueOverlay({ prompt, choices, onSelect }: DialogueOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <div style={styles.prompt}>{prompt}</div>
        <div style={styles.choices}>
          {choices.map((choice, i) => (
            <button
              key={i}
              style={{
                ...styles.choiceButton,
                ...(hoveredIndex === i ? styles.choiceHover : {}),
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSelect(i)}
            >
              <span style={styles.choiceMarker}>&rsaquo;</span>
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  panel: {
    backgroundColor: '#1a1408',
    border: '2px solid #3a2a10',
    borderRadius: '8px',
    padding: '24px 32px',
    maxWidth: '600px',
    width: '90%',
    boxShadow: '0 0 40px rgba(192, 160, 48, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  },
  prompt: {
    fontSize: '15px',
    fontFamily: '"Georgia", serif',
    color: '#c0a868',
    lineHeight: '1.6',
    marginBottom: '20px',
    borderBottom: '1px solid #2a1a08',
    paddingBottom: '16px',
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  choiceButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    color: '#a89060',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    lineHeight: '1.4',
    transition: 'all 150ms ease',
  },
  choiceHover: {
    color: '#e0c878',
    backgroundColor: 'rgba(192, 160, 48, 0.08)',
    borderColor: '#3a2a10',
  },
  choiceMarker: {
    fontSize: '18px',
    color: '#6a5a30',
    flexShrink: 0,
  },
};
