/**
 * The intro cinematic (setting.intro_scenes): painted scenes with animated sprites, lights, particles,
 * a slow camera, narration lines (with optional voice clips; radio lines get a radio filter), music and
 * sound. Everything comes from the scenario JSON. Drawn on one canvas; the text is DOM over it.
 * Click / Space / Enter: next line. Escape or "skip intro": straight to the game.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { IntroScene, IntroLine, IntroEffect, LightSource } from '../engine/types';
import { resolveAsset } from '../engine/assetResolver';
import { cameraAt, spriteAt, lineSeconds, hash01 } from '../engine/introTimeline';

interface Props {
  scenes: IntroScene[];
  scenarioId: string;
  title: string;
  onComplete: () => void;
}

const W = 1920;
const H = 1080;
/** 960x720 authoring space → canvas pixels. */
const SX = W / 960;
const SY = H / 720;
const FADE_S = 0.7;
const MUSIC_VOLUME = 0.35;

type Phase = 'title' | 'scene' | 'out' | 'in' | 'done';

export function IntroCinematic({ scenes, scenarioId, title, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef(new Map<string, HTMLImageElement>());
  const [sceneIndex, setSceneIndex] = useState(-1);
  const [lineIndex, setLineIndex] = useState(-1);
  const [lineVisible, setLineVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>('title');
  const sceneStart = useRef(performance.now());
  const fade = useRef({ color: '0,0,0', alpha: 1, from: 1, to: 0, start: performance.now(), seconds: FADE_S });
  const music = useRef<{ file: string; audio: HTMLAudioElement } | null>(null);
  const loopAudio = useRef<HTMLAudioElement | null>(null);
  const voice = useRef<HTMLAudioElement | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const timers = useRef<number[]>([]);
  const lineDone = useRef(false);
  const finished = useRef(false);

  const url = useCallback((p: string) => resolveAsset(scenarioId, p), [scenarioId]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Preload every picture the cinematic uses.
  useEffect(() => {
    const files = new Set<string>();
    for (const s of scenes) {
      if (s.background) files.add(s.background);
      for (const sp of s.sprites ?? []) files.add(sp.file);
    }
    for (const f of files) {
      const img = new Image();
      img.src = url(f);
      images.current.set(f, img);
    }
  }, [scenes, url]);

  const stopVoice = () => {
    if (voice.current) { voice.current.pause(); voice.current = null; }
  };

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    stopVoice();
    loopAudio.current?.pause();
    const m = music.current?.audio;
    if (m) {
      const start = m.volume;
      let k = 0;
      const id = window.setInterval(() => { k++; m.volume = Math.max(0, start * (1 - k / 10)); if (k >= 10) { m.pause(); clearInterval(id); } }, 60);
    }
    setPhase('done');
    fade.current = { color: '0,0,0', alpha: fade.current.alpha, from: fade.current.alpha, to: 1, start: performance.now(), seconds: 0.6 };
    window.setTimeout(onComplete, 650);
  }, [onComplete]);

  // Title card, then the first scene.
  useEffect(() => {
    later(() => goTo(0, 'fade'), 2600);
    return () => {
      clearTimers(); stopVoice(); loopAudio.current?.pause(); music.current?.audio.pause();
      audioCtx.current?.close().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Play a voice clip; radio lines go through a band-pass with crackle. Resolves with its duration (s) or null. */
  const playVoice = (line: IntroLine, onEnd: () => void): Promise<number | null> => new Promise((resolve) => {
    if (!line.voice) { resolve(null); return; }
    const a = new Audio(url(line.voice));
    voice.current = a;
    let settled = false;
    const done = (v: number | null) => { if (!settled) { settled = true; resolve(v); } };
    a.addEventListener('loadedmetadata', () => done(Number.isFinite(a.duration) ? a.duration : null));
    a.addEventListener('error', () => done(null));
    a.addEventListener('ended', () => { if (voice.current === a) onEnd(); });
    if (line.style === 'radio') {
      try {
        const ctx = audioCtx.current ?? (audioCtx.current = new AudioContext());
        const src = ctx.createMediaElementSource(a);
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 350;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
        const drive = ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 3); }
        drive.curve = curve;
        const gain = ctx.createGain();
        src.connect(hp).connect(lp).connect(drive).connect(gain).connect(ctx.destination);
        const amount = line.static ?? 0.3;
        // Crackle: filtered noise under the voice, and dropouts when the signal is bad.
        const len = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.25);
        const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
        const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2200;
        const ng = ctx.createGain(); ng.gain.value = 0.05 + amount * 0.25;
        noise.connect(nf).connect(ng).connect(ctx.destination);
        noise.start();
        a.addEventListener('ended', () => noise.stop());
        a.addEventListener('pause', () => { try { noise.stop(); } catch { /* already stopped */ } });
        if (amount > 0.45) {
          const id = window.setInterval(() => {
            if (a.paused) { clearInterval(id); return; }
            gain.gain.setTargetAtTime(Math.random() < amount * 0.35 ? 0.05 : 1, ctx.currentTime, 0.02);
          }, 180);
        }
        ctx.resume().catch(() => {});
      } catch { /* no Web Audio: play it clean */ }
    }
    a.play().catch(() => done(null));
  });

  const showLine = (si: number, li: number) => {
    const scene = scenes[si];
    const line = scene?.lines?.[li];
    if (!line) { endScene(si); return; }
    lineDone.current = false;
    setLineIndex(li);
    setLineVisible(true);
    const next = () => {
      if (lineDone.current) return;
      lineDone.current = true;
      setLineVisible(false);
      const nextLine = scene.lines?.[li + 1];
      later(() => showLine(si, li + 1), ((nextLine?.pause ?? 0.4) * 1000));
    };
    playVoice(line, next).then((secs) => {
      if (finished.current) return;
      // Without a clip, time the line by its length; with one, 'ended' advances it (this is a safety net).
      later(next, lineSeconds(line, secs) * 1000 + (secs ? 1500 : 0));
    });
  };

  const endScene = (si: number) => {
    const scene = scenes[si];
    const elapsed = (performance.now() - sceneStart.current) / 1000;
    const wait = Math.max(0, (scene.hold ?? 0) - elapsed);
    later(() => goTo(si + 1, scene.transition ?? 'fade'), wait * 1000);
  };

  const goTo = (si: number, transition: 'fade' | 'cut' | 'flash') => {
    if (finished.current) return;
    if (si >= scenes.length) { finish(); return; }
    const begin = () => {
      stopVoice();
      loopAudio.current?.pause();
      loopAudio.current = null;
      const scene = scenes[si];
      sceneStart.current = performance.now();
      setSceneIndex(si);
      setLineIndex(-1);
      setLineVisible(false);
      setPhase('scene');
      // music: a file switches track (same file keeps playing), null stops, omitted keeps
      if (scene.music === null) { music.current?.audio.pause(); music.current = null; }
      else if (scene.music && music.current?.file !== scene.music) {
        music.current?.audio.pause();
        const m = new Audio(url(scene.music)); m.loop = true; m.volume = MUSIC_VOLUME;
        m.play().catch(() => {});
        music.current = { file: scene.music, audio: m };
      }
      if (scene.sound) { const s = new Audio(url(scene.sound)); s.volume = 0.8; s.play().catch(() => {}); }
      if (scene.loop) { const l = new Audio(url(scene.loop)); l.loop = true; l.volume = 0.6; l.play().catch(() => {}); loopAudio.current = l; }
      const color = transition === 'flash' ? '255,255,255' : '0,0,0';
      fade.current = { color, alpha: transition === 'cut' ? 0 : 1, from: transition === 'cut' ? 0 : 1, to: 0,
        start: performance.now(), seconds: transition === 'flash' ? 1.0 : FADE_S };
      later(() => showLine(si, 0), ((scene.lines?.[0]?.pause ?? 0.8) * 1000));
    };
    if (transition === 'cut' || si === 0) { begin(); return; }
    const color = transition === 'flash' ? '255,255,255' : '0,0,0';
    setPhase('out');
    fade.current = { color, alpha: 0, from: 0, to: 1, start: performance.now(), seconds: transition === 'flash' ? 0.18 : FADE_S };
    later(begin, (transition === 'flash' ? 0.2 : FADE_S) * 1000);
  };

  /** Next line now (click / Space / Enter). */
  const advance = useCallback(() => {
    if (phase !== 'scene' || lineIndex < 0 || lineDone.current) return;
    stopVoice();
    clearTimers();
    lineDone.current = true;
    setLineVisible(false);
    const scene = scenes[sceneIndex];
    if (lineIndex + 1 < (scene.lines?.length ?? 0)) later(() => showLine(sceneIndex, lineIndex + 1), 250);
    else goTo(sceneIndex + 1, scene.transition ?? 'fade');
  }, [phase, lineIndex, sceneIndex, scenes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); advance(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, finish]);

  // The render loop.
  useEffect(() => {
    let raf = 0;
    const draw = (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        const scene = scenes[sceneIndex];
        if (scene && phase !== 'title') drawScene(ctx, scene, (now - sceneStart.current) / 1000, images.current);
        const f = fade.current;
        const k = Math.min(1, (now - f.start) / 1000 / f.seconds);
        f.alpha = f.from + (f.to - f.from) * k;
        if (f.alpha > 0.001) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = `rgba(${f.color},${f.alpha})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scenes, sceneIndex, phase]);

  const scene = scenes[sceneIndex];
  const line = scene?.lines?.[lineIndex];
  const card = !scene?.background || line?.style === 'card';

  return (
    <div data-intro-cinematic style={styles.overlay} onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-skip-intro]')) advance(); }}>
      <div style={styles.stage}>
        <canvas ref={canvasRef} width={W} height={H} style={styles.canvas} />
        {phase === 'title' && <div style={styles.title}>{title}</div>}
        {line && (
          <div data-intro-line style={{
            ...(card ? styles.card : styles.band),
            opacity: lineVisible ? 1 : 0,
          }}>
            <div style={line.style === 'radio' ? styles.radio : card ? styles.cardText : styles.narration}>
              {line.style === 'radio' && <span style={styles.radioTag}>RADIO</span>}
              {line.text.split('\n').map((t, i) => <div key={i}>{t}</div>)}
            </div>
          </div>
        )}
      </div>
      {phase !== 'done' && (
        <button data-skip-intro style={styles.skip} onClick={finish}>skip intro ›</button>
      )}
    </div>
  );
}

// ── drawing ───────────────────────────────────────────────────────────────

function drawScene(ctx: CanvasRenderingContext2D, scene: IntroScene, t: number, images: Map<string, HTMLImageElement>) {
  const cam = cameraAt(scene.camera, t);
  let shakeX = 0, shakeY = 0;
  for (const e of scene.effects ?? []) {
    if (e.type === 'shake' && t >= (e.delay ?? 0) && t < (e.until ?? Infinity)) {
      shakeX += (Math.random() * 2 - 1) * e.amount * SX;
      shakeY += (Math.random() * 2 - 1) * e.amount * SY;
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(W / 2 + shakeX, H / 2 + shakeY);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-W / 2 - cam.x * SX, -H / 2 - cam.y * SY);

  const bg = scene.background ? images.get(scene.background) : undefined;
  if (bg?.complete && bg.naturalWidth) {
    // cover-fit, like room backgrounds
    const s = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
    const dw = bg.naturalWidth * s, dh = bg.naturalHeight * s;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }

  for (const e of scene.effects ?? []) if (e.type === 'shade') drawEffect(ctx, e, t, 0);

  for (const sp of scene.sprites ?? []) {
    const st = spriteAt(sp, t);
    const img = images.get(sp.file);
    if (!st.visible || !img?.complete || !img.naturalWidth) continue;
    const dw = sp.frame_width * st.scale * 2;
    const dh = sp.frame_height * st.scale * 2;
    ctx.save();
    ctx.globalAlpha = st.opacity;
    if (sp.filter) ctx.filter = sp.filter;
    ctx.imageSmoothingEnabled = false;
    // rotate about the sprite's centre; (x, y) is its feet
    ctx.translate(st.x * SX, st.y * SY - dh / 2);
    if (st.rotation) ctx.rotate((st.rotation * Math.PI) / 180);
    if (sp.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, st.column * sp.frame_width, (sp.row ?? 0) * sp.frame_height, sp.frame_width, sp.frame_height,
      -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  for (const light of scene.ambient_lighting?.lights ?? []) drawLight(ctx, light, t);
  (scene.effects ?? []).forEach((e, k) => { if (e.type !== 'shade' && e.type !== 'shake') drawEffect(ctx, e, t, k); });
}

function drawLight(ctx: CanvasRenderingContext2D, light: LightSource, t: number) {
  const phase = light.phase ?? 0;
  const pulse = (Math.sin(t * light.pulse_speed * Math.PI * 2 + phase) + 0.3 * Math.sin(t * light.pulse_speed * 1.7 * Math.PI * 2 + phase + 1.3)) / 1.3;
  const alpha = Math.max(0, light.alpha + light.alpha * light.pulse_amount * pulse);
  const radius = light.radius * W * (1 + pulse * 0.08);
  const cx = light.x * W, cy = light.y * H;
  const [r, g, b] = light.color;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},${alpha * 0.5})`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
}

function drawEffect(ctx: CanvasRenderingContext2D, e: IntroEffect, t: number, k: number) {
  const local = t - (e.delay ?? 0);
  if (local < 0) return;
  if (e.type === 'shade') {
    const a = e.from + (e.to - e.from) * Math.min(1, local / Math.max(0.001, e.seconds));
    const [x, y, w, h] = e.area ?? [0, 0, 960, 720];
    const [r, g, b] = e.color ?? [0, 0, 0];
    const X = x * SX, Y = y * SY, Wd = w * SX, Hd = h * SY;
    if (e.direction === 'down' || e.direction === 'up') {
      const grad = ctx.createLinearGradient(0, Y, 0, Y + Hd);
      const top = e.direction === 'down' ? a : 0, bottom = e.direction === 'down' ? 0 : a;
      grad.addColorStop(0, `rgba(${r},${g},${b},${top})`);
      grad.addColorStop(0.55, `rgba(${r},${g},${b},${(top + bottom) / 2 + a * 0.25})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${bottom})`);
      ctx.fillStyle = grad;
    } else ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(X, Y, Wd, Hd);
    return;
  }
  if (e.type === 'particles') {
    const [x, y, w, h] = e.area;
    const [r, g, b] = e.color;
    const size = (e.size ?? 3) * SX;
    const speed = e.speed ?? 30;
    for (let n = 0; n < e.count; n++) {
      const rx = hash01(k, n, 1), ry = hash01(k, n, 2), rs = hash01(k, n, 3);
      let px = x + rx * w, py = y + ry * h, alpha = e.alpha ?? 0.8;
      const sp = speed * (0.5 + rs);
      if (e.motion === 'rise' || e.motion === 'fall') {
        const travel = ((ry * h + sp * local) % h);
        py = e.motion === 'rise' ? y + h - travel : y + travel;
        px += Math.sin(local * (0.8 + rs) + n) * 4;
        const edge = Math.min(travel, h - travel) / (h * 0.15);
        alpha *= Math.min(1, edge);
      } else if (e.motion === 'drift') {
        const ang = rs * Math.PI * 2;
        px = x + ((rx * w + Math.cos(ang) * sp * local) % w + w) % w;
        py = y + ((ry * h + Math.sin(ang) * sp * local) % h + h) % h;
      } else {
        alpha *= 0.5 + 0.5 * Math.sin(local * (1 + rs * 3) + n);
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, alpha)})`;
      const s = size * (0.6 + rs * 0.8);
      ctx.fillRect(px * SX - s / 2, py * SY - s / 2, s, s);
    }
    return;
  }
  if (e.type === 'sweep') {
    const [x, y, w, h] = e.area;
    const [r, g, b] = e.color;
    const p = (local % e.period) / e.period;
    const pos = p < 0.5 ? p * 2 : 2 - p * 2;
    const cy = (y + pos * h) * SY;
    const band = 18 * SY;
    const a = e.alpha ?? 0.6;
    const grad = ctx.createLinearGradient(0, cy - band, 0, cy + band);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${a})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x * SX, cy - band, w * SX, band * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.12})`;
    ctx.fillRect(x * SX, y * SY, w * SX, h * SY);
    return;
  }
  if (e.type === 'sparks') {
    if (e.until != null && t >= e.until) return;
    const burst = Math.floor(local / e.every);
    const bt = local - burst * e.every;
    if (bt > 0.45) return;
    const [r, g, b] = e.color ?? [255, 230, 140];
    for (let n = 0; n < 10; n++) {
      const ang = hash01(burst, n, 4) * Math.PI * 2;
      const v = 60 + hash01(burst, n, 5) * 90;
      const px = (e.at[0] + Math.cos(ang) * v * bt) * SX;
      const py = (e.at[1] + Math.sin(ang) * v * bt + 40 * bt * bt) * SY;
      ctx.fillStyle = `rgba(${r},${g},${b},${1 - bt / 0.45})`;
      ctx.fillRect(px - 3, py - 3, 6, 6);
    }
  }
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: '#000', zIndex: 2000, display: 'flex',
    alignItems: 'center', justifyContent: 'center', userSelect: 'none', cursor: 'pointer',
  },
  stage: { position: 'relative', width: 'min(100vw, calc(100vh * 16 / 9))', aspectRatio: '16 / 9' },
  canvas: { width: '100%', height: '100%', display: 'block' },
  title: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Georgia, serif', fontSize: 'clamp(22px, 4vw, 44px)', letterSpacing: '6px', color: '#c0a030',
    textTransform: 'uppercase', textShadow: '0 0 24px rgba(192,160,48,0.35)', animation: 'intro-title 2.6s ease-in-out both',
  },
  band: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: '5% 8% 3.5%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.55) 60%, rgba(0,0,0,0))',
    transition: 'opacity 0.5s ease', textAlign: 'center', pointerEvents: 'none',
  },
  card: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 12%', transition: 'opacity 0.8s ease', textAlign: 'center', pointerEvents: 'none',
  },
  narration: {
    fontFamily: 'Georgia, serif', fontSize: 'clamp(13px, 1.9vw, 22px)', lineHeight: 1.6, color: '#e2cf96',
    textShadow: '0 2px 4px #000', maxWidth: '900px', margin: '0 auto',
  },
  cardText: {
    fontFamily: 'Georgia, serif', fontSize: 'clamp(15px, 2.4vw, 28px)', lineHeight: 1.9, color: '#c9b47a',
  },
  radio: {
    fontFamily: '"Courier New", monospace', fontStyle: 'italic', fontSize: 'clamp(12px, 1.7vw, 19px)',
    lineHeight: 1.6, color: '#9fe3d6', textShadow: '0 0 6px rgba(80,220,200,0.4), 0 2px 3px #000',
    maxWidth: '860px', margin: '0 auto',
  },
  radioTag: {
    display: 'inline-block', fontStyle: 'normal', fontSize: '0.65em', letterSpacing: '2px', padding: '1px 6px',
    border: '1px solid rgba(159,227,214,0.6)', borderRadius: '3px', marginBottom: '4px', opacity: 0.8,
  },
  skip: {
    position: 'fixed', right: '16px', bottom: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid #3a3020',
    color: '#8a7a5a', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '1px', padding: '6px 12px',
    borderRadius: '4px', cursor: 'pointer', zIndex: 2001,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('intro-cinematic-kf')) {
  const el = document.createElement('style');
  el.id = 'intro-cinematic-kf';
  el.textContent = '@keyframes intro-title { 0% { opacity: 0 } 30% { opacity: 1 } 75% { opacity: 1 } 100% { opacity: 0 } }';
  document.head.appendChild(el);
}
