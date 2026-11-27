import { useEffect, useState, type CSSProperties } from 'react';
import { VERB_CURSORS } from './GameView';

const ORDER = ['look', 'move', 'hand', 'talk'];
const iconOf = (verb: string) => VERB_CURSORS[verb]?.match(/url\("([^"]+)"\)/)?.[1] ?? '';

/**
 * The quiet tutorial (setting.tutorial.style "nudge"): a small badge at the top of the picture, a mouse with its
 * right button glowing next to the verb icon turning through look → move → hand → talk. It says "right-click
 * changes what you do" without a word, and fades once the player has done it a few times. Click-through.
 * If the player hasn't right-clicked for CALL_AFTER_MS while it shows, it swells and glows once to catch the eye
 * (and again every CALL_AFTER_MS after that). `cycles` (verb changes so far) restarts that wait.
 */
const CALL_AFTER_MS = 8000;
export function VerbNudge({ visible, cycles = 0 }: { visible: boolean; cycles?: number }) {
  const [i, setI] = useState(0);
  const [calls, setCalls] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setI((n) => (n + 1) % ORDER.length), 1100);
    return () => clearInterval(t);
  }, [visible]);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setCalls((n) => n + 1), CALL_AFTER_MS);
    return () => clearInterval(t);
  }, [visible, cycles]);
  return (
    <div key={calls} style={{ ...styles.badge, opacity: visible ? 0.88 : 0, ...(visible && calls ? styles.call : {}) }}
      data-verb-nudge={visible ? 'shown' : 'hidden'} data-nudge-calls={calls} aria-hidden>
      <svg width="22" height="30" viewBox="0 0 22 30" style={{ display: 'block' }}>
        <rect x="1" y="1" width="20" height="28" rx="10" fill="#1a140c" stroke="#c0a030" strokeWidth="1.5" />
        <line x1="11" y1="1.5" x2="11" y2="12" stroke="#c0a030" strokeWidth="1.2" />
        <line x1="1.5" y1="12" x2="20.5" y2="12" stroke="#c0a030" strokeWidth="1.2" />
        <path d="M11.8 2.2 A9.2 9.2 0 0 1 20.2 11.3 L11.8 11.3 Z" fill="#f0c040" style={{ animation: 'kqNudgePulse 1.1s ease-in-out infinite' }} />
      </svg>
      <span style={styles.arrow}>›</span>
      <span style={styles.iconBox}>
        <img key={i} src={iconOf(ORDER[i])} width={26} height={26} alt="" style={styles.icon} />
      </span>
      <style>{`
        @keyframes kqNudgePulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        @keyframes kqNudgeCall { 0%,100% { transform: translateX(-50%) scale(1); box-shadow: none }
          25%,65% { transform: translateX(-50%) scale(1.35); box-shadow: 0 0 18px 4px rgba(240,192,64,.55); opacity: 1 } }
        @keyframes kqNudgeTurn { from { transform: rotateY(90deg) scale(.8); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  badge: {
    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 40,
    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
    background: 'rgba(10, 8, 5, 0.55)', border: '1px solid rgba(192, 160, 48, 0.45)', borderRadius: 20,
    pointerEvents: 'none', transition: 'opacity 900ms ease', backdropFilter: 'blur(2px)',
  },
  call: { animation: 'kqNudgeCall 1.6s ease-in-out' },
  arrow: { color: '#c0a030', fontSize: 18, lineHeight: 1, opacity: 0.8 },
  iconBox: { width: 26, height: 26, perspective: 200, display: 'inline-block' },
  icon: { display: 'block', animation: 'kqNudgeTurn 300ms ease-out' },
};
