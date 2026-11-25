import type { CSSProperties } from 'react';
import type { TutorialStep } from '../engine/types';

interface TutorialCoachProps {
  steps: TutorialStep[];
  index: number;
  onNext: () => void;
  onSkip: () => void;
  /** "Tip n of total" when not every step is on this player's route (prologue tips vs. tips for those who skipped it). */
  number?: number;
  total?: number;
}

/**
 * First-play tips (setting.tutorial). Sits in the top-left corner of the picture and never blocks
 * play (the box is click-through; only its buttons take clicks): each tip moves on when the player does what it says (or with the button on `next` tips).
 * "Skip tutorial" is always there for veterans and is remembered per scenario.
 */
export function TutorialCoach({ steps, index, onNext, onSkip, number, total }: TutorialCoachProps) {
  const step = steps[index];
  if (!step) return null;
  const last = index === steps.length - 1;
  return (
    <div style={styles.box} role="status" aria-live="polite" data-tutorial-step={index}>
      <div style={styles.head}>
        <span style={styles.count}>Tip {number ?? index + 1} of {total ?? steps.length}</span>
        <button style={styles.skip} onClick={onSkip} data-tutorial-skip>Skip tutorial</button>
      </div>
      <div style={styles.text}>{step.text}</div>
      {step.done_when === 'next' && (
        <button style={styles.next} onClick={onNext} data-tutorial-next>{last ? 'Start playing' : 'Got it'}</button>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  box: {
    position: 'absolute', top: 44, left: 12, zIndex: 40, width: 300,
    background: 'rgba(14, 10, 6, 0.92)', border: '1px solid #8a6a2a', borderRadius: 4,
    padding: '10px 12px', color: '#e8dcc0', boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
    fontFamily: "Georgia, 'Times New Roman', serif", pointerEvents: 'none', // clicks pass through to the game; only the buttons take them
  },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  count: { fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c0a030' },
  skip: { background: 'none', border: 'none', color: '#9a8a6a', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0, pointerEvents: 'auto' },
  text: { fontSize: 14, lineHeight: 1.45 },
  next: { marginTop: 8, background: '#2a2010', color: '#e8c060', border: '1px solid #8a6a2a', borderRadius: 3, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, pointerEvents: 'auto' },
};
