import { useEffect, useState, type CSSProperties } from 'react';
import type { KeypadKey, PuzzleWidget, WidgetSubmitResult } from '../engine/types';
import { resolveAsset } from '../engine/assetResolver';

interface KeypadWidgetProps {
  widget: PuzzleWidget;
  scenarioId: string;
  onKeyPress: () => void;
  onSubmit: (entry: string[]) => WidgetSubmitResult;
  onClose: () => void;
}

const normalize = (k: string | KeypadKey): KeypadKey => (typeof k === 'string' ? { value: k, label: k } : k);

export function KeypadWidget({ widget, scenarioId, onKeyPress, onSubmit, onClose }: KeypadWidgetProps) {
  const cfg = widget.config;
  const keys = (cfg.keys ?? []).map(normalize);
  const sol = cfg.solution;
  const length = cfg.code_length ?? (typeof sol === 'string' ? sol.length : Array.isArray(sol) ? sol.length : 4);
  const [entry, setEntry] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const byValue = (v: string) => keys.find((k) => k.value === v);

  const press = (k: KeypadKey) => {
    if (entry.length >= length) return;
    onKeyPress();
    const next = [...entry, k.value];
    setEntry(next);
    setFeedback(null);
    if (next.length === length) {
      setTimeout(() => {
        const result = onSubmit(next);
        if (!result.solved) {
          setFeedback(result.feedback ?? 'Nothing happens.');
          setFlash(true);
          setTimeout(() => { setFlash(false); setEntry([]); }, 450);
        }
      }, 250);
    }
  };

  const renderGlyph = (k: KeypadKey | undefined, size: number) =>
    k?.image ? (
      <img src={resolveAsset(scenarioId, k.image)} alt={k.label ?? k.value} style={{ width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }} />
    ) : (
      <span style={{ fontSize: size * 0.45 }}>{k?.label ?? k?.value}</span>
    );

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {cfg.title && <div style={styles.title}>{cfg.title}</div>}
        {cfg.prompt && <div style={styles.prompt}>{cfg.prompt}</div>}

        <div style={{ ...styles.display, ...(flash ? styles.displayFail : {}) }}>
          {Array.from({ length }).map((_, i) => (
            <div key={i} style={styles.slot}>{entry[i] !== undefined && renderGlyph(byValue(entry[i]), 44)}</div>
          ))}
        </div>
        <div style={styles.feedback}>{feedback ?? ' '}</div>

        <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${cfg.columns ?? 4}, 76px)` }}>
          {keys.map((k, i) => (
            <button
              key={k.value}
              title={k.label ?? k.value}
              aria-label={k.label ?? k.value}
              data-key={k.value}
              style={{ ...styles.key, ...(hovered === i ? styles.keyHover : {}) }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => press(k)}
            >
              {renderGlyph(k, 56)}
            </button>
          ))}
        </div>

        <div style={styles.actions}>
          <button style={styles.action} onClick={() => { setEntry([]); setFeedback(null); }}>Clear</button>
          <button style={styles.action} onClick={onClose}>Step away</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
  },
  panel: {
    background: 'radial-gradient(ellipse at 50% 0%, #22302c 0%, #141a18 60%, #0d100f 100%)',
    border: '2px solid #2f4a42', borderRadius: '14px', padding: '22px 28px 18px',
    boxShadow: '0 0 50px rgba(80, 220, 190, 0.12), inset 0 0 30px rgba(0, 0, 0, 0.6)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '380px',
  },
  title: { fontFamily: 'Georgia, serif', color: '#c0a030', letterSpacing: '3px', fontSize: '15px', textTransform: 'uppercase' },
  prompt: { color: '#9fb3ab', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', margin: '6px 0 14px', maxWidth: '340px', textAlign: 'center' },
  display: {
    display: 'flex', gap: '10px', padding: '10px 14px', borderRadius: '10px',
    background: '#071311', border: '1px solid #1f3d36', boxShadow: 'inset 0 0 14px rgba(70, 220, 180, 0.15)',
    transition: 'background 0.15s, box-shadow 0.15s',
  },
  displayFail: { background: '#2a0c0c', boxShadow: 'inset 0 0 18px rgba(255, 60, 60, 0.45)' },
  slot: {
    width: '54px', height: '54px', borderRadius: '6px', background: 'rgba(40, 80, 70, 0.25)',
    border: '1px solid #234a40', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  feedback: { color: '#e07a5f', fontFamily: 'Georgia, serif', fontSize: '13px', minHeight: '20px', margin: '8px 0 6px', textAlign: 'center' },
  grid: { display: 'grid', gap: '10px', margin: '4px 0 14px' },
  key: {
    width: '76px', height: '76px', borderRadius: '12px', cursor: 'pointer', padding: 0,
    background: 'radial-gradient(circle at 40% 30%, #4a4e4c 0%, #2c302f 70%, #1e2120 100%)',
    border: '1px solid #151817', boxShadow: '0 3px 0 #0b0d0c, inset 0 1px 0 rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8ff0d6',
  },
  keyHover: { boxShadow: '0 3px 0 #0b0d0c, 0 0 14px rgba(110, 240, 200, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)' },
  actions: { display: 'flex', gap: '12px' },
  action: {
    background: 'transparent', color: '#c0a030', border: '1px solid rgba(192,160,48,0.4)', borderRadius: '4px',
    padding: '6px 14px', fontFamily: 'Georgia, serif', letterSpacing: '1px', cursor: 'pointer',
  },
};
