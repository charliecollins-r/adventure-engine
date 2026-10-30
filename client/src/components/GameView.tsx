import { useState, useEffect, type CSSProperties } from 'react';
import type { ScenarioEngine } from '../engine/ScenarioEngine';

interface GameViewProps {
  engine: ScenarioEngine;
  activeVerb: string;
  selectedItem: string | null;
  debugMode: boolean;
  onObjectClick: (objectId: string) => void;
  onBackClick: () => void;
  onEmptyClick?: () => void;
}

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const COORD_SPACE_W = 960;
const COORD_SPACE_H = 720;
const SCALE_X = VIEW_WIDTH / COORD_SPACE_W;
const SCALE_Y = VIEW_HEIGHT / COORD_SPACE_H;

const VERB_CURSORS: Record<string, string> = {
  look: 'help',
  move: 'crosshair',
  hand: 'pointer',
  talk: 'text',
};

const styles: Record<string, CSSProperties> = {
  viewport: {
    position: 'relative',
    width: `${VIEW_WIDTH}px`,
    height: `${VIEW_HEIGHT}px`,
    overflow: 'hidden',
    margin: '0 auto',
    border: '2px solid #2a2018',
    borderRadius: '2px',
  },
  backButton: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 20px',
    fontSize: '12px',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    backgroundColor: 'rgba(20, 16, 10, 0.85)',
    border: '1px solid #3a2a18',
    borderRadius: '3px',
    cursor: 'pointer',
    zIndex: 10,
  },
  objectLabel: {
    position: 'absolute',
    bottom: '-18px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '11px',
    fontFamily: '"Georgia", serif',
    color: '#e0d0a0',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
  },
};

function objectHotspotStyle(
  x: number,
  y: number,
  w: number,
  h: number,
  hovered: boolean,
  cursor: string,
  isNav: boolean,
  debugMode: boolean,
): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    left: `${x * SCALE_X}px`,
    top: `${y * SCALE_Y}px`,
    width: `${w * SCALE_X}px`,
    height: `${h * SCALE_Y}px`,
    backgroundColor: 'transparent',
    opacity: 1,
    border: '2px solid transparent',
    borderRadius: '2px',
    cursor,
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };
  if (debugMode) {
    base.border = `2px solid ${isNav ? 'rgba(74,144,217,0.6)' : 'rgba(192,160,48,0.4)'}`;
    base.backgroundColor = isNav ? 'rgba(74,144,217,0.08)' : 'rgba(192,160,48,0.06)';
  }
  if (hovered) {
    base.border = `2px solid ${isNav ? '#4a90d9' : '#c0a030'}`;
  }
  return base;
}

const ANIMATION_KEYFRAMES = `
@keyframes hotspot-glimmer {
  0%, 100% { box-shadow: none; }
  15% { box-shadow: inset 0 0 8px 2px rgba(200, 220, 255, 0.3); }
  30% { box-shadow: none; }
  45% { box-shadow: inset 0 0 4px 1px rgba(200, 220, 255, 0.15); }
  55% { box-shadow: none; }
}
@keyframes hotspot-pulse {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: inset 0 0 6px 2px rgba(200, 180, 100, 0.25); }
}
@keyframes ambient-flicker {
  0%, 100% { opacity: 0; }
  20% { opacity: 0.03; }
  40% { opacity: 0; }
  60% { opacity: 0.05; }
  80% { opacity: 0.02; }
}
@keyframes ambient-breathe {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.08; }
}
@keyframes ambient-scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}
`;

let stylesInjected = false;
function injectAnimationStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const el = document.createElement('style');
  el.textContent = ANIMATION_KEYFRAMES;
  document.head.appendChild(el);
}

const AMBIENT_STYLES: Record<string, CSSProperties> = {
  flicker: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(ellipse at 50% 30%, rgba(100, 200, 150, 0.15), transparent 70%)',
    animation: 'ambient-flicker 8s ease-in-out infinite',
    pointerEvents: 'none', zIndex: 1,
  },
  breathe: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(ellipse at 50% 50%, rgba(80, 120, 180, 0.12), transparent 60%)',
    animation: 'ambient-breathe 10s ease-in-out infinite',
    pointerEvents: 'none', zIndex: 1,
  },
  scan: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '200%',
    background: 'linear-gradient(180deg, transparent 40%, rgba(100, 220, 160, 0.04) 50%, transparent 60%)',
    animation: 'ambient-scan 12s linear infinite',
    pointerEvents: 'none', zIndex: 1,
  },
};

export function GameView({
  engine,
  activeVerb,
  selectedItem,
  debugMode,
  onObjectClick,
  onBackClick,
  onEmptyClick,
}: GameViewProps) {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  useEffect(() => { injectAnimationStyles(); }, []);

  const view = engine.getCurrentView();
  const objects = engine.getVisibleObjects();
  const viewStack = engine.getViewStack();
  const bgColor = engine.getBackgroundColor();
  const bgFile = engine.getBackgroundFile();
  const scenarioId = engine.getScenario().metadata.id;
  const cursor = VERB_CURSORS[activeVerb] ?? 'default';

  const roomAnimation = view.room_animation;

  const cursorLabel = selectedItem
    ? `Use ${engine.getInventory().find((it) => it.id === selectedItem)?.name ?? selectedItem} on...`
    : activeVerb.charAt(0).toUpperCase() + activeVerb.slice(1);

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isObject = target.closest('[data-object-hotspot]');
    const isBackButton = target.closest('[data-back-button]');
    if (!isObject && !isBackButton && onEmptyClick) {
      onEmptyClick();
    }
  };

  return (
    <div
      style={{
        ...styles.viewport,
        backgroundColor: bgColor,
        cursor,
      }}
      onClick={handleViewportClick}
    >
      {/* Background image */}
      {bgFile && (
        <img
          src={`/scenarios/${scenarioId}/${bgFile}`}
          alt=""
          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      )}

      {/* Ambient room animation overlay */}
      {roomAnimation && AMBIENT_STYLES[roomAnimation] && (
        <div style={AMBIENT_STYLES[roomAnimation]} />
      )}

      {/* Cursor action label */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#6a5a3a',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {cursorLabel}
      </div>

      {/* Object hotspots */}
      {objects.map((obj) => {
        const isHovered = hoveredObject === obj.id;
        const isNav = obj.id.startsWith('nav_');
        const animation = obj.visual.animation;
        const hotspotStyle = objectHotspotStyle(
          obj.position.x,
          obj.position.y,
          obj.size.width,
          obj.size.height,
          isHovered,
          cursor,
          isNav,
          debugMode,
        );
        const animStyle: CSSProperties = {};
        if (animation === 'glimmer' && !isHovered) {
          animStyle.animation = 'hotspot-glimmer 6s ease-in-out infinite';
        } else if (animation === 'pulse' && !isHovered) {
          animStyle.animation = 'hotspot-pulse 3s ease-in-out infinite';
        }
        return (
          <div
            key={obj.id}
            data-object-hotspot
            style={{
              ...hotspotStyle,
              zIndex: isNav ? 2 : 1,
              ...animStyle,
            }}
            onClick={() => onObjectClick(obj.id)}
            onMouseEnter={() => setHoveredObject(obj.id)}
            onMouseLeave={() => setHoveredObject(null)}
          >
            {isHovered && <div style={styles.objectLabel}>{obj.visual.label}</div>}
          </div>
        );
      })}

      {/* Back button */}
      {(view.back_label || viewStack.length > 0) && (
        <button
          data-back-button
          style={styles.backButton}
          onClick={onBackClick}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.borderColor = '#c0a030';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.borderColor = '#3a2a18';
          }}
        >
          {view.back_label ?? '< Back'}
        </button>
      )}
    </div>
  );
}
