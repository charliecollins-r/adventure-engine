import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react';
import type { CharacterPlacement, Facing, Scenario, TutorialTrigger, WalkArea } from '../engine/types';
import { depthScaleAt, facingFromDelta, findPath, pathLength, pointAlong, resolveFacing, type Pt } from '../engine/walkable';
import { ScenarioEngine } from '../engine/ScenarioEngine';
import { resolveAsset } from '../engine/assetResolver';
import { GameView } from './GameView';
import { IntroSequence } from './IntroSequence';
import { InventoryPanel } from './InventoryPanel';
import { NoiseIndicator } from './NoiseIndicator';
import { CloseupOverlay } from './CloseupOverlay';
import { DialogueOverlay } from './DialogueOverlay';
import { KeypadWidget } from './KeypadWidget';
import { EyeOpenTransition } from './EyeOpenTransition';
import { DevPanel } from './DevPanel';
import { TutorialCoach } from './TutorialCoach';

interface ScenarioPlayerProps {
  scenario: Scenario;
  onExit: () => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d0d0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '8px',
    overflowY: 'auto' as const,
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '960px',
    padding: '8px 0',
    marginBottom: '4px',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '1rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    letterSpacing: '2px',
  },
  chromeButton: {
    padding: '4px 16px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#6a5a3a',
    backgroundColor: 'transparent',
    border: '1px solid #2a2018',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  gameArea: {
    position: 'relative' as const,
    width: '960px',
    overflow: 'hidden' as const,
  },
  bottomHud: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column' as const,
    pointerEvents: 'none' as const,
  },
  messagePanel: {
    width: '960px',
    padding: '10px 16px',
    backgroundColor: '#0d0d0a',
    borderTop: '1px solid #2a2018',
    cursor: 'pointer',
    maxHeight: '120px',
    overflowY: 'auto' as const,
    boxSizing: 'border-box' as const,
  },
  messageText: {
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    color: '#e0d0a0',
    lineHeight: '1.6',
    margin: '0 0 4px',
  },
  dismissHint: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3a3020',
    textAlign: 'right' as const,
    marginTop: '4px',
  },
  ambientPanel: {
    width: '960px',
    padding: '8px 16px',
    fontSize: '13px',
    fontFamily: '"Georgia", serif',
    color: 'rgba(90, 74, 48, 0.5)',
    fontStyle: 'italic',
    backgroundColor: '#0d0d0a',
    boxSizing: 'border-box' as const,
  },
  tabRow: {
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none' as const,
    padding: '0 4px',
  },
  inventoryTab: {
    padding: '3px 12px',
    fontSize: '11px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'color 0.2s ease',
  },
  hintTab: {
    pointerEvents: 'auto' as const,
    padding: '3px 10px',
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    backgroundColor: 'rgba(13, 13, 10, 0.6)',
    border: 'none',
    borderRadius: '0 0 3px 3px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  gameOver: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  gameOverResult: {
    fontSize: '3.5rem',
    fontFamily: '"Georgia", serif',
    letterSpacing: '6px',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  gameOverText: {
    fontSize: '1.1rem',
    fontFamily: '"Georgia", serif',
    color: '#8a7a5a',
    marginBottom: '32px',
    textAlign: 'center' as const,
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  gameOverButtons: {
    display: 'flex',
    gap: '16px',
  },
  gameOverButton: {
    padding: '10px 28px',
    fontSize: '1rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    backgroundColor: '#2a1a10',
    border: '2px solid #3a2a18',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export function ScenarioPlayer({ scenario, onExit }: ScenarioPlayerProps) {
  const engineRef = useRef<ScenarioEngine>(new ScenarioEngine(scenario));
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const devParams = useRef((() => {
    const params = new URLSearchParams(window.location.search);
    const isDev = params.has('dev');
    return {
      startView: params.get('view'),
      skipIntro: params.has('skipIntro') || !!params.get('view') || isDev,
      debug: params.has('debug') || isDev,
      isDev,
      forceTutorial: params.has('tutorial'),
    };
  })());

  const dev = devParams.current;

  const [showIntro, setShowIntro] = useState(() => {
    if (dev.skipIntro) return false;
    return !!scenario.setting.intro_text?.length;
  });
  const [eyeOpen, setEyeOpen] = useState(false);
  const [skipEyeTransition] = useState(() => dev.skipIntro);
  const [activeVerb, setActiveVerb] = useState('look');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [debugMode, setDebugMode] = useState(() => dev.debug);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [combinedOnce, setCombinedOnce] = useState(false);

  // ── First-play tutorial (setting.tutorial) ────────────────────────────────
  const tutorialSteps = scenario.setting.tutorial?.steps ?? [];
  const tutorialKey = `kq-tutorial-done:${scenario.metadata.id}`;
  const [tutIndex, setTutIndex] = useState<number | null>(null);
  const tutRef = useRef<number | null>(null);
  tutRef.current = tutIndex;
  const finishTutorial = useCallback(() => {
    setTutIndex(null);
    try { localStorage.setItem(tutorialKey, '1'); } catch { /* storage unavailable: just hide it */ }
  }, [tutorialKey]);
  const advanceTutorial = useCallback(() => {
    const i = tutRef.current;
    if (i === null) return;
    if (i + 1 >= tutorialSteps.length) finishTutorial();
    else setTutIndex(i + 1);
  }, [tutorialSteps.length, finishTutorial]);
  /** Tell the tutorial the player just did something; the current tip moves on if it was waiting for that. */
  const tutorialEvent = useCallback((t: TutorialTrigger) => {
    const i = tutRef.current;
    if (i !== null && tutorialSteps[i]?.done_when === t) advanceTutorial();
  }, [tutorialSteps, advanceTutorial]);
  const [walkthroughHighlights, setWalkthroughHighlights] = useState<string[]>([]);
  const [devPanelOpen, setDevPanelOpen] = useState(() => dev.isDev);
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const engine = engineRef.current;
  (window as unknown as Record<string, unknown>).__engine = engine;
  (window as unknown as Record<string, unknown>).__bump = bump;
  (window as unknown as Record<string, unknown>).__setHighlights = (ids: string[]) => { setWalkthroughHighlights(ids); };
  (window as unknown as Record<string, unknown>).__setDebug = (on: boolean) => { setDebugMode(on); };

  const [standingUp, setStandingUp] = useState(() => dev.skipIntro);
  const [introVoiceDurationMs, setIntroVoiceDurationMs] = useState<number | null>(null);

  const standupSet = scenario.character?.sprite_sets?.['standup'];
  const standupAnimMs = standupSet
    ? ((standupSet.columns ?? 1) / (standupSet.frame_rate || 3)) * 1000 + 200
    : 0;

  const hasIntroVoice = !!scenario.setting.sounds?.intro_voice;
  const voiceDurationValid = introVoiceDurationMs != null && introVoiceDurationMs > 0;
  const timingReady = !hasIntroVoice || introVoiceDurationMs != null;

  const standupDelayMs = voiceDurationValid
    ? Math.max(introVoiceDurationMs - standupAnimMs, 2000)
    : (standupSet ? 3000 : 0);
  const fadeDurationMs = standupSet
    ? standupDelayMs + standupAnimMs
    : (voiceDurationValid ? introVoiceDurationMs : 4000);

  useEffect(() => {
    const introVoicePath = scenario.setting.sounds?.intro_voice;
    if (!introVoicePath) return;
    const audio = new Audio(resolveAsset(scenario.metadata.id, introVoicePath));
    const onMeta = () => {
      const dur = audio.duration * 1000;
      if (Number.isFinite(dur) && dur > 0) {
        setIntroVoiceDurationMs(dur);
      } else {
        setIntroVoiceDurationMs(-1);
      }
    };
    audio.addEventListener('loadedmetadata', onMeta);
    return () => audio.removeEventListener('loadedmetadata', onMeta);
  }, [scenario]);

  useEffect(() => {
    if (dev.startView) {
      engine.navigateToView(dev.startView);
      bump();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showIntro && !eyeOpen && timingReady) {
      if (standupSet) {
        engine.setCharacterOverride({ sprite_set: 'standup', frame: 0 });
        bump();
      }
      setEyeOpen(true);
    }
  }, [showIntro, eyeOpen, engine, bump, scenario, standupSet, timingReady]);

  useEffect(() => {
    if (!eyeOpen || standingUp || !standupSet) return;
    const timer = setTimeout(() => {
      engine.setCharacterOverride({ sprite_set: 'standup' });
      bump();
      setStandingUp(true);
    }, standupDelayMs);
    return () => clearTimeout(timer);
  }, [eyeOpen, standingUp, engine, bump, standupSet, standupDelayMs]);

  const prevAudioKey = useRef<string>('');
  useEffect(() => {
    const view = engine.getCurrentView();
    const raw = view.ambient_audio ?? scenario.setting.ambient_audio;
    const files = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    const key = files.join('|');

    if (key === prevAudioKey.current) return;
    prevAudioKey.current = key;

    for (const a of audioRefs.current) {
      a.pause();
      a.src = '';
    }
    audioRefs.current = [];

    if (files.length === 0) return;

    const scenarioId = scenario.metadata.id;
    const elements: HTMLAudioElement[] = [];
    for (const file of files) {
      const audio = new Audio(resolveAsset(scenarioId, file));
      audio.loop = true;
      audio.volume = 0.35;
      audio.muted = muted;
      audio.play().catch(() => {});
      elements.push(audio);
    }
    audioRefs.current = elements;
  });

  useEffect(() => {
    for (const a of audioRefs.current) {
      a.muted = muted;
    }
  }, [muted]);

  const scenarioId = scenario.metadata.id;

  const voiceRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = useCallback(() => {
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current = null;
    }
  }, []);

  const playSound = useCallback(
    (file: string) => {
      if (muted) return;
      const isVoice = file.includes('voice/');
      const audio = new Audio(resolveAsset(scenarioId, file));
      audio.volume = isVoice ? 0.9 : 0.5;
      if (isVoice) {
        stopVoice();
        voiceRef.current = audio;
        audio.onended = () => { voiceRef.current = null; };
      }
      audio.play().catch(() => {});
    },
    [scenarioId, muted, stopVoice],
  );

  useEffect(() => {
    if (!eyeOpen) return;
    const introVoice = scenario.setting.sounds?.intro_voice;
    if (introVoice) playSound(introVoice);
  }, [eyeOpen, playSound, scenario]);

  useEffect(() => {
    if (!standingUp) return;
    const standupSet = scenario.character?.sprite_sets?.['standup'];
    if (!standupSet) return;
    const frameRate = standupSet.frame_rate || 3;
    const duration = (standupSet.columns / frameRate) * 1000 + 200;
    const timer = setTimeout(() => {
      engine.setCharacterOverride({ sprite_set: 'idle' });
      bump();
    }, duration);
    return () => clearTimeout(timer);
  }, [standingUp, engine, bump, scenario]);

  const playPendingSounds = useCallback(() => {
    const sounds = engine.getPendingSounds();
    for (const s of sounds) playSound(s);
    engine.clearPendingSounds();
  }, [engine, playSound]);

  const prevViewRef = useRef(engine.currentViewId);
  useEffect(() => {
    const currentView = engine.currentViewId;
    if (prevViewRef.current !== currentView) {
      stopVoice();
      const transitionSound = scenario.setting.sounds?.room_transition;
      if (transitionSound) playSound(transitionSound);
      prevViewRef.current = currentView;
    }
  });

  useEffect(() => {
    if (showIntro || !tutorialSteps.length) return;
    if ((dev.isDev || dev.skipIntro) && !dev.forceTutorial) return;
    let done = false;
    try { done = !dev.forceTutorial && localStorage.getItem(tutorialKey) === '1'; } catch { /* no storage */ }
    if (done) return;
    const t = setTimeout(() => setTutIndex((i) => (i === null ? 0 : i)), 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);
  useEffect(() => { if (inventoryOpen) tutorialEvent('items_opened'); }, [inventoryOpen, tutIndex, tutorialEvent]);

  // A loud action is heard: play setting.sounds.noise when the noise level jumps by 3 or more.
  const prevNoise = useRef(0);
  useEffect(() => {
    const n = engine.getNoiseLevel();
    const loud = scenario.setting.sounds?.noise;
    if (loud && n >= prevNoise.current + 3) playSound(loud);
    prevNoise.current = n;
  });

  const prevItemCount = useRef(-1);
  useEffect(() => {
    const count = engine.getInventory().length;
    if (prevItemCount.current >= 0 && count > prevItemCount.current) {
      tutorialEvent('item_taken');
      setInventoryOpen(true);
      const pickupSound = scenario.setting.sounds?.item_pickup;
      if (pickupSound) playSound(pickupSound);
    }
    prevItemCount.current = count;
  });

  /** Run an interaction now (also used when a walk arrives). */
  const runInteraction = useCallback(
    (objectId: string, verb: string, itemId?: string) => {
      const invBefore = new Set(engine.getInventory().map((i) => i.id));
      if (verb === 'use_item' && itemId) engine.interact(objectId, 'use_item', itemId);
      else engine.interact(objectId, verb);
      if (verb === 'look') tutorialEvent('looked');
      else if (verb === 'hand') tutorialEvent('handled');
      else if (verb === 'talk') tutorialEvent('talked');
      const invAfter = new Set(engine.getInventory().map((i) => i.id));
      const itemConsumed = [...invBefore].some((id) => !invAfter.has(id));
      const itemTransformed = [...invAfter].some((id) => !invBefore.has(id));
      if (itemConsumed || itemTransformed) {
        const useSound = scenario.setting.sounds?.item_pickup;
        if (useSound) playSound(useSound);
      }
      playPendingSounds();
      bump();
    },
    [engine, bump, playPendingSounds, playSound, scenario, tutorialEvent],
  );
  const runRef = useRef(runInteraction);
  runRef.current = runInteraction;

  // ── Walking (docs/WALKABLE_AREAS.md) ─────────────────────────────────────
  // The engine stores where the character stands; this animates him along a route and runs the
  // pending interaction on arrival. Views without a walk_area never get here.
  interface WalkJob {
    path: Pt[];
    travelled: number;
    last: number;
    viewId: string;
    area: WalkArea;
    walkSet: string;
    pending: { objectId: string; verb: string; itemId?: string } | null;
    finalFacing?: Facing;
    stepAt: number;
    walkTime: number;
    lastFrame: number;
    shown: number;
  }
  const [pose, setPose] = useState<Partial<CharacterPlacement> | null>(null);
  const walkRef = useRef<WalkJob | null>(null);
  const rafRef = useRef(0);
  const clickPointRef = useRef<{ x: number; y: number } | null>(null);

  /** The walk area if the character can walk right now (not during the intro stand-up or after death). */
  const walkableNow = useCallback((): WalkArea | null => {
    const area = engine.getWalkArea();
    const p = engine.getCharacterPlacement();
    if (!area || !p || p.sprite_set === 'standup' || engine.isGameOver()) return null;
    return area;
  }, [engine]);

  const directionsOf = (set: string) => scenario.character?.sprite_sets[set]?.directions;

  // Footsteps (character.footsteps, overridden per view by walk_area.footsteps; false = silent)
  const lastStepRef = useRef(-1);
  const stepConfig = (area: WalkArea, walkSet: string) => {
    const cfg = area.footsteps === false ? null : (area.footsteps ?? scenario.character?.footsteps ?? null);
    if (!cfg || !cfg.sounds?.length) return null;
    const fr = scenario.character?.sprite_sets[walkSet]?.frame_rate || 6;
    return { ...cfg, interval: cfg.interval ?? 2 / fr };
  };
  const playStep = (cfg: { sounds: string[]; volume?: number }) => {
    if (muted) return;
    let i = Math.floor(Math.random() * cfg.sounds.length);
    if (cfg.sounds.length > 1 && i === lastStepRef.current) i = (i + 1) % cfg.sounds.length;
    lastStepRef.current = i;
    const a = new Audio(resolveAsset(scenario.metadata.id, cfg.sounds[i]));
    a.volume = Math.max(0, Math.min(1, (cfg.volume ?? 0.4) * (0.85 + Math.random() * 0.15)));
    (a as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = false;
    a.playbackRate = 0.94 + Math.random() * 0.12;
    a.play().catch(() => {});
  };

  /** Stop walking where he is (his current spot becomes his position). */
  const stopWalk = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const job = walkRef.current;
    walkRef.current = null;
    if (job && pose && pose.x !== undefined && pose.y !== undefined && engine.getCurrentView().id === job.viewId) {
      engine.setCharacterPosition({ x: pose.x, y: pose.y, facing: pose.facing });
    }
    setPose(null);
  }, [engine, pose]);

  const finishWalk = useCallback((job: WalkJob) => {
    const end = job.path[job.path.length - 1];
    const prev = job.path.length > 1 ? job.path[job.path.length - 2] : end;
    const dx = end.x - prev.x;
    const idle = engine.getCharacterPlacement()?.sprite_set ?? '';
    const want = job.finalFacing ?? (job.path.length > 1 ? facingFromDelta(dx, end.y - prev.y) : engine.getCharacterPlacement()?.facing ?? 'right');
    engine.setCharacterPosition({ x: end.x, y: end.y, facing: resolveFacing(want, directionsOf(idle), dx) });
    walkRef.current = null;
    setPose(null);
    if (job.pending) runRef.current(job.pending.objectId, job.pending.verb, job.pending.itemId);
    else bump();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, bump, scenario]);

  const tick = useCallback((now: number) => {
    const job = walkRef.current;
    if (!job) return;
    if (engine.getCurrentView().id !== job.viewId || engine.isGameOver()) {
      walkRef.current = null;
      setPose(null);
      return;
    }
    const dt = Math.min(0.05, Math.max(0, (now - job.last) / 1000));
    job.last = now;
    const here = pointAlong(job.path, job.travelled).pt;
    const speed = (scenario.character?.walk_speed ?? 150) * depthScaleAt(job.area, here.y);
    job.travelled += speed * dt;
    job.walkTime += dt;
    const steps = stepConfig(job.area, job.walkSet);
    const ws = scenario.character?.sprite_sets[job.walkSet];
    const motion = scenario.character?.walk_motion ?? 'paced';
    const synced = motion !== 'smooth' && !!ws && (ws.frame_rate ?? 0) > 0;
    let shownAt = job.travelled;
    let frame: number | undefined;
    if (synced) {
      // The walk-cycle frame and the footsteps share one clock with the movement.
      const cols = ws!.columns, phase = job.walkTime * ws!.frame_rate!, frameNo = Math.floor(phase);
      if (frameNo !== job.lastFrame) {
        job.lastFrame = frameNo; job.shown = job.travelled;
        if (steps && frameNo % Math.max(1, Math.round(cols / 2)) === 0) playStep(steps);
      }
      frame = frameNo % cols;
      if (motion === 'stepped') {
        // Sierra-style: the drawn position only advances when the frame changes.
        shownAt = job.shown;
      } else {
        // "paced": continuous, but each stride slows as the foot plants and speeds up mid-stride.
        // Offset is 0 at every frame boundary, so he never jumps; speed varies between (1 - pulse) and (1 + pulse).
        const pulse = Math.min(0.95, Math.max(0, scenario.character?.walk_pulse ?? 0.6));
        const stride = speed / ws!.frame_rate!, u = phase - frameNo;
        shownAt = Math.max(0, job.travelled - (pulse * stride * Math.sin(2 * Math.PI * u)) / (2 * Math.PI));
      }
    } else if (steps && now >= job.stepAt) {
      playStep(steps);
      job.stepAt = now + (steps.interval * 1000) / Math.max(0.3, depthScaleAt(job.area, here.y));
    }
    if (pointAlong(job.path, job.travelled).done) { finishWalk(job); return; }
    const { pt, leg } = pointAlong(job.path, shownAt);
    const a = job.path[Math.max(0, leg - 1)], b = job.path[Math.max(1, leg)] ?? a;
    const facing = resolveFacing(facingFromDelta(b.x - a.x, b.y - a.y), directionsOf(job.walkSet), b.x - a.x);
    setPose({ x: pt.x, y: pt.y, facing, sprite_set: job.walkSet, frame });
    rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, scenario, finishWalk, muted]);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  /** Walk to `target` (snapped onto the floor), then run `pending` if given. Returns false if he can't walk here. */
  const startWalk = useCallback(
    (target: { x: number; y: number }, pending: WalkJob['pending'], finalFacing?: Facing): boolean => {
      const area = walkableNow();
      if (!area) return false;
      const placed = engine.getCharacterPlacement()!;
      const from = walkRef.current && pose?.x !== undefined && pose?.y !== undefined ? { x: pose.x, y: pose.y } : { x: placed.x, y: placed.y };
      cancelAnimationFrame(rafRef.current);
      const sets = scenario.character?.sprite_sets ?? {};
      const walkSet = sets[placed.sprite_set]?.walk ?? (sets.walk ? 'walk' : placed.sprite_set);
      const job: WalkJob = {
        path: findPath(area, from, target), travelled: 0, last: performance.now(),
        viewId: engine.getCurrentView().id, area, walkSet, pending, finalFacing,
        stepAt: walkRef.current ? walkRef.current.stepAt : performance.now() + 60,
        // a redirect keeps the walk cycle going instead of restarting it
        walkTime: walkRef.current ? walkRef.current.walkTime : 0,
        lastFrame: walkRef.current ? walkRef.current.lastFrame : -1,
        shown: 0,
      };
      engine.dismissMessages();
      if (!pending) tutorialEvent('walked');
      walkRef.current = job;
      if (pathLength(job.path) < 0.5) { finishWalk(job); return true; }
      rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
      return true;
    },
    [engine, scenario, pose, walkableNow, finishWalk, tutorialEvent],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /** Turn to face an object without moving (Look/Talk in a walking view). */
  const faceToward = useCallback((objectId: string) => {
    if (!walkableNow()) return;
    stopWalk();
    const p = engine.getCharacterPlacement();
    const f = engine.getObjectFocus(objectId);
    if (!p || !f) return;
    const dx = f.x - p.x;
    engine.setCharacterPosition({ x: p.x, y: p.y, facing: resolveFacing(facingFromDelta(dx, f.y - p.y), directionsOf(p.sprite_set), dx) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, walkableNow, stopWalk, scenario]);

  const handleObjectClick = useCallback(
    (objectId: string) => {
      const itemId = selectedItem ?? undefined;
      const verb = itemId ? 'use_item' : activeVerb;
      if (itemId) setSelectedItem(null);
      if (!walkableNow()) { runInteraction(objectId, verb, itemId); return; }
      if (verb === 'look' || verb === 'talk') {
        faceToward(objectId);
        runInteraction(objectId, verb, itemId);
        return;
      }
      // Move on anything that isn't an exit (a rug, a floor grating, the ceiling pipes): walk to the spot.
      if (verb === 'move' && !engine.isExit(objectId)) {
        if (clickPointRef.current) startWalk(clickPointRef.current, null);
        bump();
        return;
      }
      const approach = engine.getApproach(objectId);
      if (!approach) {
        faceToward(objectId);
        runInteraction(objectId, verb, itemId);
        return;
      }
      startWalk(approach, { objectId, verb, itemId }, approach.facing);
      bump();
    },
    [engine, activeVerb, selectedItem, bump, runInteraction, walkableNow, faceToward, startWalk],
  );

  const handleEmptyClick = useCallback((point?: { x: number; y: number }) => {
    if (point && activeVerb === 'move' && !selectedItem && walkableNow()) {
      startWalk(point, null);
      bump();
      return;
    }
    engine.dismissMessages();
    const pick = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];
    if (selectedItem) {
      engine.showMessage(
        pick([
          "You can't use that here.",
          "There's nothing here to use that on.",
          "That won't work on empty space.",
        ]),
      );
      setSelectedItem(null);
      bump();
    } else {
      const pools: Record<string, string[]> = {
        move: [
          "You can't go that way.",
          "There's no passage there.",
          "That direction leads nowhere.",
          "You don't see an exit there.",
        ],
        look: [
          "You don't see anything noteworthy there.",
          "Nothing catches your eye.",
          "Just the walls of the room.",
          "Nothing unusual in that spot.",
        ],
        hand: [
          "There's nothing to interact with there.",
          "You grasp at nothing.",
          "Your hand finds only empty air.",
          "Nothing useful within reach there.",
        ],
        talk: [
          "There's nobody to talk to there.",
          "You speak into the silence. No reply.",
          "Your words echo back unanswered.",
          "Nobody responds.",
        ],
      };
      const pool = pools[activeVerb] ?? ['Nothing happens.', "That doesn't do anything."];
      engine.showMessage(pick(pool));
      bump();
    }
  }, [engine, activeVerb, selectedItem, bump, walkableNow, startWalk]);

  const VERB_ORDER = ['look', 'move', 'hand', 'talk'];

  const handleCycleVerb = useCallback(() => {
    setActiveVerb((prev) => {
      const idx = VERB_ORDER.indexOf(prev);
      return VERB_ORDER[(idx + 1) % VERB_ORDER.length];
    });
    setSelectedItem(null);
    tutorialEvent('verb_changed');
  }, [tutorialEvent]);

  const handleItemSelect = useCallback(
    (itemId: string) => {
      if (selectedItem && selectedItem !== itemId) {
        const result = engine.combineItems(selectedItem, itemId);
        if (result.success) {
          setCombinedOnce(true);
          // A successful combination sounds like getting a new item (setting.sounds.combine, else item_pickup).
          const combineSound = scenario.setting.sounds?.combine ?? scenario.setting.sounds?.item_pickup;
          if (combineSound) playSound(combineSound);
        }
        setSelectedItem(null);
        playPendingSounds();
        bump();
      } else if (selectedItem === itemId) {
        setSelectedItem(null);
      } else {
        setSelectedItem(itemId);
        tutorialEvent('item_selected');
        const item = engine.getInventory().find((it) => it.id === itemId);
        if (item) {
          engine.showMessage(item.description);
          bump();
        }
      }
    },
    [engine, selectedItem, bump, playPendingSounds, playSound, scenario, tutorialEvent],
  );

  const handleItemExamine = useCallback(
    (itemId: string) => {
      engine.examineItem(itemId, 'look');
      playPendingSounds();
      bump();
    },
    [engine, bump, playPendingSounds],
  );

  const handleDismiss = useCallback(() => {
    stopVoice();
    engine.dismissMessages();
    bump();
  }, [engine, bump, stopVoice]);

  const handleRestart = useCallback(() => {
    engineRef.current = new ScenarioEngine(scenario);
    setActiveVerb('look');
    setSelectedItem(null);
    setInventoryOpen(false);
    bump();
  }, [scenario, bump]);

  const handleNavigateBack = useCallback(() => {
    engine.navigateBack();
    const transitionSound = scenario.setting.sounds?.room_transition;
    if (transitionSound) playSound(transitionSound);
    bump();
  }, [engine, bump, playSound, scenario]);

  const handleHint = useCallback(() => {
    tutorialEvent('hint_used');
    const hint = engine.getHint();
    if (hint) {
      engine.showMessage(hint);
    } else {
      engine.showMessage('No hints available for this room.');
    }
    bump();
  }, [engine, bump, tutorialEvent]);

  const handleDevViewChange = useCallback(
    (viewId: string) => {
      engine.navigateToView(viewId);
      bump();
    },
    [engine, bump],
  );

  const handleDevHighlight = useCallback(
    (objectId: string | null) => {
      setWalkthroughHighlights(objectId ? [objectId] : []);
    },
    [],
  );

  const handleDevCharOverride = useCallback(
    (override: Parameters<typeof engine.setCharacterOverride>[0]) => {
      engine.setCharacterOverride(override);
      bump();
    },
    [engine, bump],
  );

  const handleDialogueSelect = useCallback(
    (index: number) => {
      engine.selectDialogueChoice(index);
      playPendingSounds();
      bump();
    },
    [engine, bump, playPendingSounds],
  );

  const handleWidgetKey = useCallback(() => { engine.pressWidgetKey(); }, [engine]);
  const handleWidgetSubmit = useCallback(
    (entry: string[]) => {
      const result = engine.submitWidget(entry);
      playPendingSounds();
      bump();
      return result;
    },
    [engine, bump, playPendingSounds],
  );
  const handleWidgetClose = useCallback(() => { engine.closeWidget(); bump(); }, [engine, bump]);

  const messages = engine.getMessages();
  const inventory = engine.getInventory();
  const noiseLevel = engine.getNoiseLevel();
  const gameOverResult = engine.getGameOverResult();
  const closeupImage = engine.getCloseupImage();
  const dialogue = engine.getDialogue();
  const activeWidget = engine.getActiveWidget();
  const ambientText = scenario.setting.ambient_text;

  const handleCloseupDismiss = useCallback(() => {
    engine.dismissCloseup();
    bump();
  }, [engine, bump]);

  if (showIntro && scenario.setting.intro_text?.length) {
    return (
      <IntroSequence
        pages={scenario.setting.intro_text}
        title={scenario.metadata.title}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div style={{
      ...styles.container,
      ...(devPanelOpen ? { flexDirection: 'row' as const, alignItems: 'stretch', paddingTop: 0, height: '100vh', overflow: 'hidden' as const } : {}),
    }}>
      {/* Game column */}
      <div style={devPanelOpen ? { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', paddingTop: '8px', overflowY: 'auto' as const } : { width: '100%', display: 'contents' }}>
      {/* Minimal title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <div style={styles.title}>{scenario.metadata.title}</div>
          <NoiseIndicator level={noiseLevel} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {dev.isDev && (
            <button
              style={{
                ...styles.chromeButton,
                color: devPanelOpen ? '#44cc66' : '#6a5a3a',
                borderColor: devPanelOpen ? '#2a6a30' : '#2a2018',
              }}
              onClick={() => setDevPanelOpen((d) => !d)}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = '#2a6a30'; }}
              onMouseLeave={(e) => { if (!devPanelOpen) (e.target as HTMLElement).style.borderColor = '#2a2018'; }}
            >
              {devPanelOpen ? 'DEV ON' : 'DEV'}
            </button>
          )}
          <button
            style={{
              ...styles.chromeButton,
              color: debugMode ? '#e0c040' : '#6a5a3a',
              borderColor: debugMode ? '#6a5a30' : '#2a2018',
            }}
            onClick={() => setDebugMode((d) => !d)}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = '#6a5a30';
            }}
            onMouseLeave={(e) => {
              if (!debugMode) (e.target as HTMLElement).style.borderColor = '#2a2018';
            }}
          >
            {debugMode ? 'Debug ON' : 'Debug'}
          </button>
          {(scenario.setting.ambient_audio || scenario.views.some(v => v.ambient_audio)) && (
            <button
              style={styles.chromeButton}
              onClick={() => setMuted((m) => !m)}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = '#6a5a30';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = '#2a2018';
              }}
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
          )}
          <button
            style={styles.chromeButton}
            onClick={onExit}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = '#6a5a30';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = '#2a2018';
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Game viewport with HUD overlays */}
      <div style={styles.gameArea}>
        <GameView
          engine={engine}
          activeVerb={activeVerb}
          selectedItem={selectedItem}
          debugMode={debugMode}
          walkthroughHighlights={walkthroughHighlights}
          onObjectClick={handleObjectClick}
          onEmptyClick={handleEmptyClick}
          onCycleVerb={handleCycleVerb}
          onNavigateBack={handleNavigateBack}
          onClickPoint={(p) => { clickPointRef.current = p; }}
          characterPose={pose}
        />

        {tutIndex !== null && (
          <TutorialCoach steps={tutorialSteps} index={tutIndex} onNext={advanceTutorial} onSkip={finishTutorial} />
        )}

        {/* Bottom HUD overlay — hint button only */}
        <div style={styles.bottomHud}>
          <div style={styles.tabRow}>
            <div />
            <button
              style={{ ...styles.hintTab, color: '#5a4a30' }}
              onClick={handleHint}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#c0a030';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#5a4a30';
              }}
            >
              ?
            </button>
          </div>
        </div>

        {/* Eye-open animation scoped to viewport */}
        {!skipEyeTransition && <EyeOpenTransition active={eyeOpen} durationMs={fadeDurationMs} />}
      </div>

      {/* Inventory + text feedback below viewport */}
      <div style={{ width: '960px', backgroundColor: '#0d0d0a' }}>
        {/* Inventory toggle tab */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px',
          borderTop: '1px solid #2a2018',
        }}>
          <button
            style={{
              ...styles.inventoryTab,
              color: inventoryOpen ? '#c0a030' : '#5a4a30',
            }}
            onClick={() => setInventoryOpen((o) => !o)}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#c0a030';
            }}
            onMouseLeave={(e) => {
              if (!inventoryOpen) (e.target as HTMLElement).style.color = '#5a4a30';
            }}
          >
            {inventoryOpen ? '▾' : '▸'} Items
            {inventory.length > 0 ? ` (${inventory.length})` : ''}
          </button>
        </div>
        {/* Collapsible inventory tray */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: inventoryOpen ? '220px' : '0', // room for the items to wrap onto several rows
            transition: 'max-height 0.3s ease',
            backgroundColor: '#0d0d0a',
            borderBottom: inventoryOpen ? '1px solid rgba(42, 32, 24, 0.4)' : 'none',
          }}
        >
          <InventoryPanel
            items={inventory}
            selectedItem={selectedItem}
            scenarioId={scenario.metadata.id}
            onItemSelect={handleItemSelect}
            onItemExamine={handleItemExamine}
            showCombineTip={!combinedOnce}
          />
        </div>
        {/* Messages or ambient text */}
        {messages.length > 0 ? (
          <div style={{ ...styles.messagePanel, width: '100%' }} onClick={handleDismiss}>
            {messages.map((msg, i) => (
              <p key={i} style={styles.messageText}>
                {msg}
              </p>
            ))}
            <div style={styles.dismissHint}>click to dismiss</div>
          </div>
        ) : ambientText ? (
          <div style={{ ...styles.ambientPanel, width: '100%' }}>{ambientText}</div>
        ) : null}
      </div>

      {/* Closeup overlay */}
      {closeupImage && (
        <CloseupOverlay
          imageSrc={resolveAsset(scenario.metadata.id, closeupImage)}
          onClose={handleCloseupDismiss}
        />
      )}

      {/* Dialogue choice overlay */}
      {dialogue && (
        <DialogueOverlay
          prompt={dialogue.prompt}
          choices={dialogue.choices}
          onSelect={handleDialogueSelect}
        />
      )}

      {/* Puzzle widget overlay (keypad) */}
      {activeWidget && activeWidget.widget_type === 'keypad' && (
        <KeypadWidget
          key={activeWidget.id}
          widget={activeWidget}
          scenarioId={scenario.metadata.id}
          onKeyPress={handleWidgetKey}
          onSubmit={handleWidgetSubmit}
          onClose={handleWidgetClose}
        />
      )}

      {/* Game over overlay */}
      {gameOverResult && (
        <div style={styles.gameOver}>
          <div
            style={{
              ...styles.gameOverResult,
              color: gameOverResult.won ? '#44cc44' : '#cc4444',
              textShadow: gameOverResult.won
                ? '0 0 30px rgba(68, 204, 68, 0.4)'
                : '0 0 30px rgba(204, 68, 68, 0.4)',
            }}
          >
            {gameOverResult.title ?? (gameOverResult.won ? 'You Escaped' : 'Game Over')}
          </div>
          <div style={styles.gameOverText}>{gameOverResult.text}</div>
          <div style={styles.gameOverButtons}>
            <button style={styles.gameOverButton} onClick={handleRestart}>
              Play Again
            </button>
            <button style={styles.gameOverButton} onClick={onExit}>
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Close game column wrapper */}
      </div>

      {/* Dev panel */}
      {devPanelOpen && (
        <DevPanel
          engine={engine}
          scenario={scenario}
          onViewChange={handleDevViewChange}
          onHighlightObject={handleDevHighlight}
          onCharacterOverride={handleDevCharOverride}
          bump={bump}
        />
      )}
    </div>
  );
}
