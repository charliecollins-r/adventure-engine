import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Scenario, ScenarioObject, CharacterPlacement } from '../engine/types';
import { ScenarioEngine } from '../engine/ScenarioEngine';
import { resolveAsset } from '../engine/assetResolver';

interface DevPanelProps {
  engine: ScenarioEngine;
  scenario: Scenario;
  onViewChange: (viewId: string) => void;
  onHighlightObject: (objectId: string | null) => void;
  onCharacterOverride: (override: Partial<CharacterPlacement> | null) => void;
  bump: () => void;
}

type TabId = 'views' | 'objects' | 'character' | 'sprites' | 'export';

const C = {
  bg: '#0d0d0a',
  panel: '#151210',
  panelAlt: '#1a1610',
  border: '#2a2018',
  gold: '#c0a030',
  goldDim: '#6a5a3a',
  text: '#e0d0a0',
  textDim: '#8a7a5a',
  nav: '#4488cc',
  green: '#44cc66',
  red: '#cc4444',
};

const base: CSSProperties = {
  fontFamily: "'Consolas', 'Monaco', monospace",
  fontSize: '12px',
  color: C.text,
};

// ── Animated sprite preview (used in Character + Sprites tabs) ──────────────

function SpritePreview({ src, fw, fh, cols, rows, frameRate, scale, label }: {
  src: string; fw: number; fh: number; cols: number; rows: number;
  frameRate: number; scale: number; label?: string;
}) {
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(0);

  const previewScale = Math.min(1, 120 / (fh * scale), 200 / (fw * scale));
  const displayW = fw * scale * previewScale;
  const displayH = fh * scale * previewScale;
  const sheetW = cols * fw * scale * previewScale;
  const sheetH = rows * fh * scale * previewScale;

  useEffect(() => {
    if (frameRate <= 0 || cols <= 1) return;
    setFrame(0);
    let last = 0;
    const interval = 1000 / frameRate;
    const tick = (time: number) => {
      if (time - last >= interval) {
        last = time;
        setFrame(f => (f + 1) % cols);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frameRate, cols, src]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        width: `${displayW}px`,
        height: `${displayH}px`,
        backgroundImage: `url(${src})`,
        backgroundPosition: `${-frame * displayW}px 0px`,
        backgroundSize: `${sheetW}px ${sheetH}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated' as CSSProperties['imageRendering'],
        border: `1px solid ${C.border}`,
        borderRadius: '3px',
        backgroundColor: C.bg,
      }} />
      <div style={{ fontSize: '10px', color: C.textDim, textAlign: 'center' }}>
        {label && <span style={{ color: C.gold }}>{label} </span>}
        {fw}x{fh} | {cols}f @ {frameRate}fps | s={scale}
        <br />frame {frame + 1}/{cols}
      </div>
    </div>
  );
}

// ── Tab: Views ──────────────────────────────────────────────────────────────

function ViewsTab({ scenario, engine, onViewChange }: {
  scenario: Scenario; engine: ScenarioEngine; onViewChange: (id: string) => void;
}) {
  const currentId = engine.currentViewId;
  return (
    <div style={{ padding: '6px' }}>
      <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {scenario.views.length} views total
      </div>
      {scenario.views.map(v => {
        const isCurrent = v.id === currentId;
        const objCount = v.objects.length;
        const hasBg = !!v.background_file;
        const hasChar = !!v.character;
        return (
          <div
            key={v.id}
            onClick={() => onViewChange(v.id)}
            style={{
              padding: '5px 8px',
              marginBottom: '2px',
              borderRadius: '3px',
              cursor: 'pointer',
              backgroundColor: isCurrent ? 'rgba(192,160,48,0.12)' : 'transparent',
              borderLeft: isCurrent ? `3px solid ${C.gold}` : '3px solid transparent',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: isCurrent ? C.gold : C.text, fontWeight: isCurrent ? 'bold' : 'normal' }}>
                {v.name || v.id}
              </span>
              <span style={{ fontSize: '10px', color: C.textDim }}>{objCount} obj</span>
            </div>
            <div style={{ fontSize: '10px', color: C.textDim, display: 'flex', gap: '8px' }}>
              <span style={{ color: v.id === currentId ? C.textDim : '#555' }}>{v.id}</span>
              <span style={{ marginLeft: 'auto' }}>
                {hasBg ? '🖼' : '—'}
                {hasChar ? ' 🧍' : ''}
                {v.hints?.length ? ` 💡${v.hints.length}` : ''}
                {v.ambient_lighting ? ' ✨' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Objects ─────────────────────────────────────────────────────────────

function ObjectsTab({ engine, scenario, onHighlight }: {
  engine: ScenarioEngine; scenario: Scenario; onHighlight: (id: string | null) => void;
}) {
  const view = engine.getCurrentView();
  const visibleIds = new Set(engine.getVisibleObjects().map(o => o.id));
  const allObjects = view.objects.map(id => scenario.objects.find(o => o.id === id)).filter(Boolean) as ScenarioObject[];

  return (
    <div style={{ padding: '6px' }}>
      <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {view.name || view.id} — {allObjects.length} objects ({visibleIds.size} visible)
      </div>
      {allObjects.map(obj => {
        const isNav = obj.id.startsWith('nav_');
        const isVisible = visibleIds.has(obj.id);
        const hasSprite = !!obj.sprite;
        return (
          <div
            key={obj.id}
            onMouseEnter={() => onHighlight(obj.id)}
            onMouseLeave={() => onHighlight(null)}
            style={{
              padding: '5px 8px',
              marginBottom: '2px',
              borderRadius: '3px',
              cursor: 'pointer',
              opacity: isVisible ? 1 : 0.5,
              borderLeft: `3px solid ${isNav ? C.nav : hasSprite ? C.green : C.goldDim}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: isNav ? C.nav : C.text }}>{obj.name}</span>
              <span style={{ fontSize: '10px', color: isVisible ? C.green : C.red }}>
                {isVisible ? 'vis' : 'hid'}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: C.textDim }}>
              {obj.id}
            </div>
            <div style={{ fontSize: '10px', color: C.textDim, display: 'flex', gap: '12px' }}>
              <span>pos({obj.position.x}, {obj.position.y})</span>
              <span>size({obj.size.width}x{obj.size.height})</span>
              {hasSprite && <span style={{ color: C.green }}>sprite</span>}
              {isNav && <span style={{ color: C.nav }}>nav</span>}
            </div>
            <div style={{ fontSize: '10px', color: C.textDim }}>
              state: {engine.getObjectState(obj.id)} | {obj.interactions.length} interactions
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Character ──────────────────────────────────────────────────────────

function CharacterTab({ engine, scenario, onOverride, bump }: {
  engine: ScenarioEngine; scenario: Scenario;
  onOverride: (o: Partial<CharacterPlacement> | null) => void; bump: () => void;
}) {
  const charConfig = scenario.character;
  const placement = engine.getCharacterPlacement();
  const scenarioId = scenario.metadata.id;

  if (!charConfig) {
    return <div style={{ padding: '16px', color: C.textDim }}>No character config in this scenario.</div>;
  }

  const setNames = Object.keys(charConfig.sprite_sets);
  const currentSet = placement?.sprite_set ?? setNames[0];
  const spriteSet = charConfig.sprite_sets[currentSet];
  const directions = spriteSet?.directions ?? ['down'];
  const currentFacing = placement?.facing ?? 'down';

  const handleSetChange = (set: string) => {
    onOverride({ sprite_set: set });
    bump();
  };

  const handleFacingChange = (facing: string) => {
    onOverride({ facing: facing as CharacterPlacement['facing'] });
    bump();
  };

  return (
    <div style={{ padding: '6px' }}>
      <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Character Config
      </div>

      {/* Placement info */}
      {placement ? (
        <div style={{ padding: '6px 8px', marginBottom: '8px', backgroundColor: C.panelAlt, borderRadius: '3px', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '4px' }}>Current Placement</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: '11px' }}>
            <span>x: <b style={{ color: C.gold }}>{placement.x}</b></span>
            <span>y: <b style={{ color: C.gold }}>{placement.y}</b></span>
            <span>facing: <b style={{ color: C.gold }}>{placement.facing}</b></span>
            <span>set: <b style={{ color: C.gold }}>{placement.sprite_set}</b></span>
            {placement.object_id && <span style={{ gridColumn: '1/3' }}>object_id: {placement.object_id}</span>}
          </div>
        </div>
      ) : (
        <div style={{ padding: '8px', color: C.textDim, fontStyle: 'italic', marginBottom: '8px' }}>
          No character placement on this view.
        </div>
      )}

      {/* Frame dimensions */}
      <div style={{ padding: '6px 8px', marginBottom: '8px', backgroundColor: C.panelAlt, borderRadius: '3px', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '4px' }}>Frame Config</div>
        <div style={{ fontSize: '11px' }}>
          frame: {charConfig.frame_width}x{charConfig.frame_height} | scale: {charConfig.scale ?? 1}
          {charConfig.shadow && (
            <span style={{ color: C.textDim }}> | shadow: {charConfig.shadow.width}x{charConfig.shadow.height}</span>
          )}
        </div>
      </div>

      {/* Sprite set / facing controls */}
      <div style={{ padding: '6px 8px', marginBottom: '8px', backgroundColor: C.panelAlt, borderRadius: '3px', border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '6px' }}>Preview Controls</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '10px', color: C.textDim }}>Set:</label>
          <select
            value={currentSet}
            onChange={e => handleSetChange(e.target.value)}
            style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}`, padding: '2px 6px', fontFamily: 'inherit', fontSize: '11px', borderRadius: '2px' }}
          >
            {setNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '10px', color: C.textDim }}>Facing:</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {directions.map(d => (
              <button
                key={d}
                onClick={() => handleFacingChange(d)}
                style={{
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  background: d === currentFacing ? 'rgba(192,160,48,0.2)' : C.bg,
                  color: d === currentFacing ? C.gold : C.textDim,
                  border: `1px solid ${d === currentFacing ? C.gold : C.border}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animated preview */}
      {spriteSet && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px' }}>
          <SpritePreview
            src={resolveAsset(scenarioId, spriteSet.file)}
            fw={charConfig.frame_width}
            fh={charConfig.frame_height}
            cols={spriteSet.columns}
            rows={spriteSet.rows}
            frameRate={spriteSet.frame_rate ?? 0}
            scale={charConfig.scale ?? 1}
            label={currentSet}
          />
        </div>
      )}

      {/* All sprite sets list */}
      <div style={{ fontSize: '10px', color: C.textDim, marginTop: '8px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        All Sprite Sets ({setNames.length})
      </div>
      {setNames.map(name => {
        const ss = charConfig.sprite_sets[name];
        return (
          <div key={name} style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: name === currentSet ? C.gold : C.text }}>{name}</span>
            <span style={{ color: C.textDim }}>
              {ss.columns}x{ss.rows} @ {ss.frame_rate ?? 0}fps
              {ss.loop === false ? ' (no loop)' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Sprites ────────────────────────────────────────────────────────────

function SpritesTab({ scenario }: { scenario: Scenario }) {
  const scenarioId = scenario.metadata.id;

  // Gather all sprites: character + object sprites
  const sprites: { label: string; src: string; fw: number; fh: number; cols: number; rows: number; fr: number; sc: number }[] = [];

  // Character sprite sets
  if (scenario.character) {
    const ch = scenario.character;
    for (const [name, ss] of Object.entries(ch.sprite_sets)) {
      sprites.push({
        label: `char: ${name}`,
        src: resolveAsset(scenarioId, ss.file),
        fw: ch.frame_width,
        fh: ch.frame_height,
        cols: ss.columns,
        rows: ss.rows,
        fr: ss.frame_rate ?? 0,
        sc: ch.scale ?? 1,
      });
    }
  }

  // Object sprites (deduplicate by file)
  const seenFiles = new Set<string>();
  for (const obj of scenario.objects) {
    if (obj.sprite && !seenFiles.has(obj.sprite.file)) {
      seenFiles.add(obj.sprite.file);
      sprites.push({
        label: obj.name,
        src: resolveAsset(scenarioId, obj.sprite.file),
        fw: obj.sprite.frame_width,
        fh: obj.sprite.frame_height,
        cols: obj.sprite.columns,
        rows: obj.sprite.rows,
        fr: obj.sprite.frame_rate,
        sc: obj.sprite.scale,
      });
    }
  }

  return (
    <div style={{ padding: '6px' }}>
      <div style={{ fontSize: '10px', color: C.textDim, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {sprites.length} sprite sheets
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sprites.map((sp, i) => (
          <div key={i} style={{
            padding: '8px',
            backgroundColor: C.panelAlt,
            borderRadius: '3px',
            border: `1px solid ${C.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <SpritePreview
              src={sp.src}
              fw={sp.fw}
              fh={sp.fh}
              cols={sp.cols}
              rows={sp.rows}
              frameRate={sp.fr}
              scale={sp.sc}
              label={sp.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Export ──────────────────────────────────────────────────────────────

function ExportTab({ engine, scenario }: { engine: ScenarioEngine; scenario: Scenario }) {
  const [copied, setCopied] = useState(false);

  const view = engine.getCurrentView();
  const placement = engine.getCharacterPlacement();
  const objects = engine.getVisibleObjects();
  const allViewObjects = view.objects.map(id => scenario.objects.find(o => o.id === id)).filter(Boolean) as ScenarioObject[];

  let text = `=== DEV PANEL EXPORT ===\n`;
  text += `Scenario: ${scenario.metadata.id}\n`;
  text += `View: ${view.id} (${view.name || 'unnamed'})\n`;
  text += `Date: ${new Date().toISOString()}\n\n`;

  if (placement) {
    text += `CHARACTER PLACEMENT:\n`;
    text += `  x: ${placement.x}, y: ${placement.y}, facing: ${placement.facing}, sprite_set: ${placement.sprite_set}\n`;
    if (placement.object_id) text += `  object_id: ${placement.object_id}\n`;
    text += `\n`;
  } else {
    text += `CHARACTER: none on this view\n\n`;
  }

  text += `OBJECTS IN VIEW (${allViewObjects.length} total, ${objects.length} visible):\n`;
  for (const obj of allViewObjects) {
    const vis = objects.some(o => o.id === obj.id);
    const isNav = obj.id.startsWith('nav_');
    text += `  ${obj.id}: pos(${obj.position.x}, ${obj.position.y}) size(${obj.size.width}x${obj.size.height})`;
    text += ` [${vis ? 'visible' : 'hidden'}]`;
    text += isNav ? ' [nav]' : '';
    text += obj.sprite ? ' [sprite]' : '';
    text += ` state="${engine.getObjectState(obj.id)}"`;
    text += `\n`;
  }

  text += `\n=== JSON PATCH ===\n`;
  const patch: Record<string, unknown> = {
    scenario: scenario.metadata.id,
    view: view.id,
  };
  if (placement) {
    patch.character = { x: placement.x, y: placement.y, facing: placement.facing, sprite_set: placement.sprite_set };
  }
  patch.objects = allViewObjects.map(obj => ({
    id: obj.id,
    position: { x: obj.position.x, y: obj.position.y },
    size: { width: obj.size.width, height: obj.size.height },
  }));
  text += JSON.stringify(patch, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '10px', color: C.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Export for Claude
        </div>
        <button
          onClick={handleCopy}
          style={{
            padding: '3px 10px',
            fontSize: '10px',
            fontFamily: 'inherit',
            background: copied ? 'rgba(68,204,102,0.15)' : C.bg,
            color: copied ? C.green : C.gold,
            border: `1px solid ${copied ? C.green : C.gold}`,
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy All'}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        style={{
          flex: 1,
          minHeight: '300px',
          background: C.bg,
          color: C.text,
          border: `1px solid ${C.border}`,
          padding: '8px',
          fontFamily: "'Consolas', monospace",
          fontSize: '11px',
          resize: 'vertical',
          borderRadius: '3px',
        }}
      />
    </div>
  );
}

// ── Main DevPanel ───────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'views', label: 'Views' },
  { id: 'objects', label: 'Objects' },
  { id: 'character', label: 'Char' },
  { id: 'sprites', label: 'Sprites' },
  { id: 'export', label: 'Export' },
];

export function DevPanel({ engine, scenario, onViewChange, onHighlightObject, onCharacterOverride, bump }: DevPanelProps) {
  const [tab, setTab] = useState<TabId>('views');

  return (
    <div style={{
      ...base,
      width: '340px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: C.panel,
      borderLeft: `1px solid ${C.border}`,
      flexShrink: 0,
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${C.border}`,
        backgroundColor: C.bg,
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: '10px',
              fontFamily: 'inherit',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: t.id === tab ? C.panel : 'transparent',
              color: t.id === tab ? C.gold : C.textDim,
              border: 'none',
              borderBottom: t.id === tab ? `2px solid ${C.gold}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'views' && <ViewsTab scenario={scenario} engine={engine} onViewChange={onViewChange} />}
        {tab === 'objects' && <ObjectsTab engine={engine} scenario={scenario} onHighlight={onHighlightObject} />}
        {tab === 'character' && <CharacterTab engine={engine} scenario={scenario} onOverride={onCharacterOverride} bump={bump} />}
        {tab === 'sprites' && <SpritesTab scenario={scenario} />}
        {tab === 'export' && <ExportTab engine={engine} scenario={scenario} />}
      </div>

      {/* Status footer */}
      <div style={{
        padding: '4px 8px',
        borderTop: `1px solid ${C.border}`,
        fontSize: '10px',
        color: C.textDim,
        display: 'flex',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span>{scenario.metadata.id}</span>
        <span>{engine.currentViewId}</span>
      </div>
    </div>
  );
}
