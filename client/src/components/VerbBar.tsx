import { useState, type CSSProperties } from 'react';

interface VerbBarProps {
  activeVerb: string;
  onVerbSelect: (verb: string) => void;
  availableVerbs?: string[];
}

const VERBS = [
  { id: 'look', label: 'Look' },
  { id: 'take', label: 'Take' },
  { id: 'use', label: 'Use' },
  { id: 'hand', label: 'Hand' },
  { id: 'talk', label: 'Talk' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'open', label: 'Open' },
  { id: 'close', label: 'Close' },
];

const styles: Record<string, CSSProperties> = {
  bar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#1a1a1a',
    borderTop: '1px solid #2a2018',
  },
};

function buttonStyle(active: boolean, available: boolean): CSSProperties {
  return {
    padding: '6px 14px',
    fontSize: '13px',
    fontFamily: '"Georgia", serif',
    color: !available ? '#4a4030' : active ? '#e0c040' : '#c0a030',
    backgroundColor: active ? '#3a2a18' : '#252018',
    border: active ? '1px solid #c0a030' : '1px solid #3a2a18',
    borderRadius: '3px',
    cursor: available ? 'pointer' : 'default',
    opacity: available ? 1 : 0.4,
    transition: 'all 0.15s ease',
    textTransform: 'capitalize' as const,
  };
}

export function VerbBar({ activeVerb, onVerbSelect, availableVerbs }: VerbBarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={styles.bar}>
      {VERBS.map(({ id, label }) => {
        const available = !availableVerbs || availableVerbs.includes(id);
        const active = activeVerb === id;
        const isHovered = hovered === id;

        return (
          <button
            key={id}
            style={{
              ...buttonStyle(active, available),
              ...(isHovered && available && !active
                ? { backgroundColor: '#2a2018', borderColor: '#6a5a30' }
                : {}),
            }}
            onClick={() => available && onVerbSelect(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
