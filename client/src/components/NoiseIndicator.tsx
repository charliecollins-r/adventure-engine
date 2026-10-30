import type { CSSProperties } from 'react';

interface NoiseIndicatorProps {
  level: number;
}

function getBarColor(level: number): string {
  if (level > 80) return '#cc2222';
  if (level > 60) return '#cc6622';
  if (level > 30) return '#ccaa22';
  return '#44aa44';
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#8a7a5a',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  track: {
    width: '120px',
    height: '10px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #3a3020',
    borderRadius: '2px',
    overflow: 'hidden',
  },
};

export function NoiseIndicator({ level }: NoiseIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, level));

  return (
    <div style={styles.container}>
      <span style={styles.label}>Noise</span>
      <div style={styles.track}>
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            backgroundColor: getBarColor(clamped),
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
