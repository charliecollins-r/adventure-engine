import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Scenario } from '../engine/types';
import { enterFullscreen } from '../fullscreen';

interface ScenarioLoaderProps {
  onLoad: (scenario: Scenario) => void;
  /**
   * Skip the menu and start a scenario straight away when the URL asks for it: ?play=<id>, or the developer
   * parameters ?dev / ?skipIntro / ?view (the first scenario in the manifest). Only on the first visit,
   * so leaving a game always lands on the menu.
   */
  autoLaunch?: boolean;
}

/** Placeholders for the Steam Workshop integration (see CLAUDE.md North Star). */
const WORKSHOP_SLOTS = [
  { title: 'Browse the Workshop', text: 'Community adventures, made by players and their AI agents. Subscribe and they appear here.' },
  { title: 'Subscribed adventures', text: 'Adventures you subscribe to on the Steam Workshop, downloaded and ready to play.' },
  { title: 'Publish your adventure', text: 'Package a scenario.json and its art and audio, check it, and share it on the Workshop.' },
];

interface ScenarioMeta {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  estimated_minutes?: number;
  credits?: string;
  cover?: string;
  menuAudio?: string;
  menuVolume?: number;
  loading: boolean;
  error?: string;
}

/** Specks of dust drifting up through the light: fixed positions and timings (no randomness between renders). */
const MOTES = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: 30 + r(1) * 68, size: 1.5 + r(2) * 2.5, dur: 16 + r(3) * 18, delay: -r(4) * 30, sway: Math.round((r(5) - 0.5) * 80) };
});

const SERIF = '"Georgia", "Times New Roman", serif';
const styles: Record<string, CSSProperties> = {
  // A full-screen title screen: the featured adventure's painting, the menu as an overlay on its left.
  screen: { position: 'fixed', inset: 0, background: '#050504', overflow: 'hidden', color: '#e8dcc0', fontFamily: SERIF },
  breathe: { position: 'absolute', inset: 0, animation: 'kq-title-breathe 9s ease-in-out infinite', willChange: 'transform, filter' },
  glow: {
    position: 'absolute', inset: '-10%', pointerEvents: 'none', mixBlendMode: 'screen',
    background: 'radial-gradient(ellipse 45% 40% at 72% 38%, rgba(255,214,150,0.35), rgba(255,180,90,0.08) 55%, rgba(0,0,0,0) 75%)',
    animation: 'kq-title-glow 9s ease-in-out infinite',
  },
  motes: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' },
  art: { position: 'absolute', inset: '-2%', backgroundSize: 'cover', backgroundPosition: 'center', animation: 'kq-title-drift 40s ease-in-out infinite alternate' },
  shade: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, rgba(5,5,4,0.92) 0%, rgba(5,5,4,0.72) 34%, rgba(5,5,4,0.15) 62%, rgba(5,5,4,0) 100%), linear-gradient(0deg, rgba(5,5,4,0.7) 0%, rgba(5,5,4,0) 30%)',
  },
  menu: {
    position: 'absolute', left: 'max(24px, 6vw)', top: 0, bottom: 0, width: 'min(460px, 88vw)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px',
  },
  eyebrow: { fontFamily: 'monospace', fontSize: '12px', letterSpacing: '4px', color: '#8a7a5a', textTransform: 'uppercase' },
  title: { fontSize: 'clamp(34px, 5vw, 64px)', letterSpacing: '6px', color: '#d9b54a', textTransform: 'uppercase', lineHeight: 1.05, textShadow: '0 2px 24px rgba(0,0,0,0.7)', animation: 'kq-title-shine 9s ease-in-out infinite' },
  blurb: { fontSize: '16px', lineHeight: 1.6, color: '#cfc3a6', maxWidth: '42ch', textShadow: '0 1px 3px #000' },
  meta: { fontFamily: 'monospace', fontSize: '12px', color: '#8a7a5a', letterSpacing: '1px' },
  play: {
    alignSelf: 'flex-start', padding: '14px 44px', fontFamily: SERIF, fontSize: '20px', letterSpacing: '6px', textTransform: 'uppercase',
    color: '#120e06', background: '#d9b54a', border: '1px solid #f0d27a', borderRadius: '3px', cursor: 'pointer', boxShadow: '0 4px 24px rgba(217,181,74,0.25)',
    animation: 'kq-play-pulse 4.5s ease-in-out infinite',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' },
  item: {
    background: 'transparent', border: 'none', borderLeft: '2px solid transparent', color: '#b8a878', fontFamily: SERIF, fontSize: '16px',
    textAlign: 'left', padding: '6px 12px', cursor: 'pointer',
  },
  itemSoon: { fontFamily: 'monospace', fontSize: '10px', letterSpacing: '1px', color: '#6a5a30', marginLeft: '10px', textTransform: 'uppercase' },
  panel: {
    background: 'rgba(10,9,7,0.82)', border: '1px solid rgba(120,100,60,0.45)', borderRadius: '6px', padding: '14px 16px',
    display: 'grid', gap: '10px', backdropFilter: 'blur(3px)',
  },
  credits: { position: 'absolute', right: '20px', bottom: '14px', fontFamily: 'monospace', fontSize: '11px', color: '#7a6a4a', textShadow: '0 1px 2px #000', maxWidth: '60vw', textAlign: 'right' },
};

export function ScenarioLoader({ onLoad, autoLaunch }: ScenarioLoaderProps) {
  const [metas, setMetas] = useState<ScenarioMeta[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/scenarios/manifest.json')
      .then((r) => r.json())
      .then((ids: string[]) => {
        setMetas(
          ids.map((id) => ({
            id,
            title: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: '',
            loading: true,
          })),
        );
        const params = new URLSearchParams(window.location.search);
        const direct = params.get('play') || (['dev', 'skipIntro', 'view'].some((k) => params.has(k)) ? ids[0] : null);
        if (autoLaunch && direct) {
          fetch(`/scenarios/${direct}/scenario.json`)
            .then((r) => r.json())
            .then((data) => onLoad(data as Scenario))
            .catch(() => {});
          return;
        }
        ids.forEach((id) => {
          fetch(`/scenarios/${id}/scenario.json`)
            .then((r) => r.json())
            .then((data) => {
              setMetas((prev) =>
                prev.map((m) =>
                  m.id === id
                    ? {
                        ...m,
                        title: data.metadata?.title ?? m.title,
                        description: data.metadata?.description ?? '',
                        difficulty: data.metadata?.difficulty,
                        estimated_minutes: data.metadata?.estimated_minutes,
                        credits: data.metadata?.credits,
                        cover: data.metadata?.cover ?? (data.views?.[0]?.background_file as string | undefined),
                        menuAudio: data.metadata?.menu_audio,
                        menuVolume: data.metadata?.menu_audio_volume,
                        loading: false,
                      }
                    : m,
                ),
              );
            })
            .catch(() => {
              setMetas((prev) =>
                prev.map((m) =>
                  m.id === id ? { ...m, loading: false, error: 'Failed to load' } : m,
                ),
              );
            });
        });
      })
      .catch(() => {
        // No manifest — show upload-only mode
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = async (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const r = await fetch(`/scenarios/${id}/scenario.json`);
      const scenario = (await r.json()) as Scenario;
      onLoad(scenario);
    } catch {
      setLoadingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const scenario = JSON.parse(reader.result as string) as Scenario;
        onLoad(scenario);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const featured = metas[0];
  // metadata.menu_audio: a looping bed under the title screen, faded in; browsers that block autoplay start it on the
  // first click or key. It is allowed past the audio gate (data-menu-audio) and stops when the menu goes away.
  const menuAudioUrl = featured?.menuAudio ? `/scenarios/${featured.id}/${featured.menuAudio}` : null;
  const menuVolume = featured?.menuVolume ?? 0.7;
  useEffect(() => {
    if (!menuAudioUrl) return;
    const a = new Audio(menuAudioUrl);
    a.loop = true; a.volume = 0; a.dataset.menuAudio = '1';
    let fade = 0;
    const fadeTo = (target: number, ms: number) => {
      clearInterval(fade);
      const from = a.volume, t0 = performance.now();
      fade = window.setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        a.volume = from + (target - from) * k;
        if (k >= 1) clearInterval(fade);
      }, 50);
    };
    const start = () => { a.play().then(() => { fadeTo(menuVolume, 2500); remove(); }).catch(() => {}); };
    const remove = () => { window.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start); };
    window.addEventListener('pointerdown', start); window.addEventListener('keydown', start);
    start();
    return () => { remove(); clearInterval(fade); a.pause(); a.src = ''; };
  }, [menuAudioUrl, menuVolume]);
  const others = metas.slice(1);
  const [openPanel, setOpenPanel] = useState<'workshop' | 'more' | null>(null);
  const start = (id: string) => { enterFullscreen(); handleCardClick(id); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && featured && !featured.loading && !loadingId) start(featured.id); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div style={styles.screen} data-title-screen>
      <style>{'@keyframes kq-title-drift { from { transform: scale(1.02) translate(0, 0); } to { transform: scale(1.09) translate(-1.5%, -1%); } } @keyframes kq-title-breathe { 0%, 100% { transform: scale(1); filter: brightness(0.92) saturate(1); } 50% { transform: scale(1.035); filter: brightness(1.04) saturate(1.08); } } @keyframes kq-title-glow { 0%, 100% { opacity: 0.35; transform: translate(0, 0) scale(1); } 50% { opacity: 0.7; transform: translate(-3%, 2%) scale(1.08); } } @keyframes kq-title-mote { 0% { transform: translate(0, 0); opacity: 0; } 12% { opacity: 0.8; } 85% { opacity: 0.5; } 100% { transform: translate(var(--kq-sway, 20px), -105vh); opacity: 0; } } @keyframes kq-title-shine { 0%, 100% { text-shadow: 0 2px 24px rgba(0,0,0,0.7); } 50% { text-shadow: 0 2px 24px rgba(0,0,0,0.7), 0 0 28px rgba(217,181,74,0.35); } } @keyframes kq-play-pulse { 0%, 100% { box-shadow: 0 4px 24px rgba(217,181,74,0.25); } 50% { box-shadow: 0 4px 34px rgba(217,181,74,0.5); } } @media (prefers-reduced-motion: reduce) { [data-title-art], [data-title-breathe], [data-title-glow], [data-title-mote], [data-play], [data-title-name] { animation: none !important; } [data-title-mote] { display: none; } } [data-menu-item]:hover, [data-menu-item]:focus-visible { color: #f0d27a !important; border-left-color: #d9b54a !important; outline: none; } [data-play]:hover, [data-play]:focus-visible { background: #f0d27a !important; outline: none; }'}</style>
      {featured?.cover && (
        // The painting breathes: a slow in-and-out (9 s) over a long drift (40 s), with light that swells with it.
        <div data-title-breathe style={styles.breathe}>
          <div data-title-art style={{ ...styles.art, backgroundImage: `url(/scenarios/${featured.id}/${featured.cover})` }} />
        </div>
      )}
      <div data-title-glow style={styles.glow} />
      <div aria-hidden style={styles.motes}>
        {MOTES.map((m, i) => (
          <span key={i} data-title-mote style={{ position: 'absolute', left: `${m.x}%`, bottom: '-4%', width: m.size, height: m.size, borderRadius: '50%',
            ['--kq-sway' as string]: `${m.sway}px`, background: 'rgba(255,236,190,0.8)', boxShadow: '0 0 6px rgba(255,220,150,0.7)', opacity: 0,
            animation: `kq-title-mote ${m.dur}s linear ${m.delay}s infinite` }} />
        ))}
      </div>
      <div data-title-shade style={styles.shade} />
      <div style={styles.menu}>
        <div style={styles.eyebrow}>Adventure Engine</div>
        {featured && (
          <>
            <div data-title-name style={styles.title}>{featured.title}</div>
            {!featured.loading && featured.description && (
              <div style={styles.blurb}>{featured.description.length > 220 ? featured.description.slice(0, 220).replace(/\s+\S*$/, '') + '…' : featured.description}</div>
            )}
            <div style={styles.meta}>
              {featured.difficulty && <span>{featured.difficulty}</span>}
              {featured.estimated_minutes ? <span> · about {Math.round(featured.estimated_minutes / 60) || 1} h</span> : null}
            </div>
            <button data-play autoFocus style={styles.play} disabled={featured.loading || !!loadingId || !!featured.error} onClick={() => start(featured.id)}>
              {loadingId === featured.id ? 'Loading…' : 'Play'}
            </button>
          </>
        )}
        <div style={styles.list}>
          {others.length > 0 && (
            <button data-menu-item style={styles.item} onClick={() => setOpenPanel(openPanel === 'more' ? null : 'more')}>More adventures</button>
          )}
          {openPanel === 'more' && (
            <div style={styles.panel}>
              {others.map((m) => (
                <button key={m.id} data-menu-item style={styles.item} disabled={m.loading || !!m.error} onClick={() => start(m.id)}>{m.title}</button>
              ))}
            </div>
          )}
          <button data-menu-item style={styles.item} onClick={() => setOpenPanel(openPanel === 'workshop' ? null : 'workshop')}>
            Steam Workshop<span style={styles.itemSoon}>coming soon</span>
          </button>
          {openPanel === 'workshop' && (
            <div style={styles.panel} data-workshop>
              {WORKSHOP_SLOTS.map((w) => (
                <div key={w.title} aria-disabled="true">
                  <div style={{ color: '#cfc3a6' }}>{w.title}</div>
                  <div style={{ fontSize: '13px', color: '#8a7a5a', lineHeight: 1.5 }}>{w.text}</div>
                </div>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
          <button data-menu-item style={styles.item} onClick={() => fileRef.current?.click()}>Load your own adventure…</button>
        </div>
      </div>
      {featured?.credits && <div data-credits style={styles.credits}>{featured.credits}</div>}
    </div>
  );
}
