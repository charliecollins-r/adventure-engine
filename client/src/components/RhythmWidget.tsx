import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { RhythmSetup } from '../engine/ScenarioEngine';

/**
 * The rhythm widget (widget_type "rhythm"): she breathes a phrase of long and short beats, then you answer it,
 * holding the mouse button (or Space) for a long breath and tapping for a short one, in time with her beat.
 * Each phrase allows `maxErrors` mistakes (wrong length, or far off the beat); more and the attempt fails.
 */
interface Props {
  setup: RhythmSetup;
  /** Plays a beat sound (a setting.sounds key or file). */
  playSound: (key: string) => void;
  onFinish: (solved: boolean) => void;
}

type Stage = 'intro' | 'call' | 'answer' | 'between' | 'done';

const box: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 600,
  display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none',
};
const panel: CSSProperties = {
  width: 560, padding: '22px 26px', background: '#140c10', border: '2px solid #5a2a3a', borderRadius: 6,
  color: '#e8d8c0', fontFamily: 'Georgia, serif', textAlign: 'center', boxShadow: '0 0 40px rgba(220,140,60,0.15)',
};

export function RhythmWidget({ setup, playSound, onFinish }: Props) {
  const { phrases, beatMs, longMs, maxErrors, hint, config } = setup;
  const [stage, setStage] = useState<Stage>('intro');
  const [phrase, setPhrase] = useState(0);
  const [lit, setLit] = useState(-1);          // beat lit during her call
  const [answered, setAnswered] = useState<('ok' | 'bad')[]>([]);
  const [errors, setErrors] = useState(0);
  const [note, setNote] = useState('');
  const pressAt = useRef<number | null>(null);
  const answerStart = useRef(0);
  const st = useRef({ phrase: 0, answered: [] as ('ok' | 'bad')[], errors: 0, stage: 'intro' as Stage });
  st.current = { phrase, answered, errors, stage };
  const pattern = phrases[phrase] ?? '';

  // Her call: light and sound each beat in time; a long beat lasts two beats.
  useEffect(() => {
    if (stage !== 'call') return;
    const timers: number[] = [];
    let t = 400;
    [...pattern].forEach((b, i) => {
      timers.push(window.setTimeout(() => {
        setLit(i);
        const s = b === 'L' ? config.long_sound : config.short_sound;
        if (s) playSound(s);
      }, t));
      t += beatMs * (b === 'L' ? 2 : 1);
    });
    timers.push(window.setTimeout(() => { setLit(-1); answerStart.current = performance.now(); setStage('answer'); }, t + beatMs * 0.5));
    return () => timers.forEach(clearTimeout);
  }, [stage, pattern, beatMs, config, playSound]);

  // Where each of your beats is due, measured from the start of your answer.
  const due = (i: number) => [...pattern].slice(0, i).reduce((a, b) => a + beatMs * (b === 'L' ? 2 : 1), 0);

  const press = () => { if (st.current.stage === 'answer' && pressAt.current === null) pressAt.current = performance.now(); };
  const release = () => {
    if (st.current.stage !== 'answer' || pressAt.current === null) return;
    const held = performance.now() - pressAt.current;
    const started = pressAt.current - answerStart.current;
    pressAt.current = null;
    const i = st.current.answered.length;
    const want = pattern[i];
    const kind = held >= longMs ? 'L' : 'S';
    // Generous timing: within half a beat either side of where it was due (the first beat is free).
    const onBeat = i === 0 || Math.abs(started - due(i)) <= beatMs * 0.6 + (i * beatMs * 0.15);
    const ok = kind === want && onBeat;
    const nextAnswered = [...st.current.answered, ok ? 'ok' as const : 'bad' as const];
    const nextErrors = st.current.errors + (ok ? 0 : 1);
    setNote(ok ? '' : kind !== want ? (want === 'L' ? 'That wanted a long breath.' : 'That wanted a short breath.') : 'Off the beat. The brood hiss.');
    if (!ok) {
      setErrors(nextErrors);
      if (nextErrors >= maxErrors) { setStage('done'); window.setTimeout(() => onFinish(false), 900); return; }
      // a mistake: the brood hiss and she breathes the phrase again
      setAnswered([]);
      setStage('between');
      window.setTimeout(() => setStage('call'), 1100);
      return;
    }
    setAnswered(nextAnswered);
    if (nextAnswered.length === pattern.length) {
      if (st.current.phrase + 1 >= phrases.length) { setStage('done'); window.setTimeout(() => onFinish(true), 900); }
      else { setStage('between'); window.setTimeout(() => { setPhrase((p) => p + 1); setAnswered([]); setErrors(0); setStage('call'); }, 1300); }
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) press(); } if (e.key === 'Escape') onFinish(false); };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); release(); } };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  });

  const beatDot = (b: string, i: number) => {
    const state = stage === 'call' ? (i === lit ? 'lit' : i < lit ? 'past' : 'idle') : answered[i] ?? (hint && stage === 'answer' && i === answered.length ? 'hint' : 'idle');
    const bg = state === 'lit' ? '#ffb040' : state === 'ok' ? '#70c070' : state === 'bad' ? '#c04040' : state === 'hint' ? '#6a4a20' : state === 'past' ? '#7a5020' : '#2a1a18';
    return <div key={i} data-beat={b} data-state={state} style={{ width: b === 'L' ? 64 : 26, height: 26, borderRadius: 13, background: bg, border: '1px solid #8a5a3a', transition: 'background 0.1s' }} />;
  };

  return (
    <div style={box} data-rhythm-widget onMouseDown={press} onMouseUp={release} onMouseLeave={release}>
      <div style={panel} onMouseDown={(e) => { e.stopPropagation(); press(); }}>
        <div style={{ fontSize: 20, color: '#f0c060', marginBottom: 6 }}>{config.title ?? 'Answer her'}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
          {config.prompt ?? 'Listen to her phrase, then answer it: hold for a long breath, tap for a short one (mouse or Space).'}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 10 }}>Phrase {phrase + 1} of {phrases.length}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '10px 0 16px' }}>{[...pattern].map(beatDot)}</div>
        <div style={{ minHeight: 20, fontSize: 14, color: stage === 'answer' ? '#f0d090' : '#c0a080' }} data-rhythm-stage={stage}>
          {stage === 'intro' && <button style={btn} onMouseDown={(e) => e.stopPropagation()} onClick={() => setStage('call')} data-rhythm-start>Listen</button>}
          {stage === 'call' && 'She breathes...'}
          {stage === 'answer' && (note || 'Your turn.')}
          {stage === 'between' && (note || 'Good.')}
          {stage === 'done' && (errors >= maxErrors ? 'The guard shoulders you back.' : 'She is quiet. She heard you.')}
        </div>
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>Mistakes {errors} of {maxErrors} · Escape to step back</div>
      </div>
    </div>
  );
}

const btn: CSSProperties = { background: '#3a1a20', color: '#f0d090', border: '1px solid #8a5a3a', borderRadius: 4, padding: '6px 18px', fontFamily: 'Georgia, serif', fontSize: 15, cursor: 'pointer' };
