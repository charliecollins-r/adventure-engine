import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { ScenarioEngine } from '../engine/ScenarioEngine';
import { AmbientCanvas } from './AmbientCanvas';

interface GameViewProps {
  engine: ScenarioEngine;
  activeVerb: string;
  selectedItem: string | null;
  debugMode: boolean;
  onObjectClick: (objectId: string) => void;
  onBackClick: () => void;
  onEmptyClick?: () => void;
  onCycleVerb?: () => void;
}

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const COORD_SPACE_W = 960;
const COORD_SPACE_H = 720;
const SCALE_X = VIEW_WIDTH / COORD_SPACE_W;
const SCALE_Y = VIEW_HEIGHT / COORD_SPACE_H;

const VERB_CURSORS: Record<string, string> = {
  look: "url('/cursors/look.png') 14 16, help",
  move: "url('/cursors/move.png') 10 24, crosshair",
  hand: "url('/cursors/hand.png') 10 4, pointer",
  talk: "url('/cursors/talk.png') 8 20, text",
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
    base.border = `2px solid ${isNav ? 'rgba(220,50,50,0.7)' : 'rgba(192,160,48,0.4)'}`;
    base.backgroundColor = isNav ? 'rgba(220,50,50,0.06)' : 'rgba(192,160,48,0.06)';
  }
  if (hovered && debugMode) {
    base.border = `2px solid ${isNav ? '#4a90d9' : '#c0a030'}`;
  }
  return base;
}

const ANIMATION_KEYFRAMES = `
@keyframes glint-flash {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  8% { opacity: 1; transform: scale(1) rotate(15deg); }
  12% { opacity: 0.6; transform: scale(0.8) rotate(20deg); }
  16% { opacity: 0; transform: scale(0.3) rotate(25deg); }
  30% { opacity: 0; }
  34% { opacity: 0.5; transform: scale(0.6) rotate(-10deg); }
  37% { opacity: 0; transform: scale(0.3) rotate(-5deg); }
}
@keyframes screen-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
@keyframes room-transition {
  0% { opacity: 0; }
  40% { opacity: 1; }
  60% { opacity: 1; }
  100% { opacity: 0; }
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


export function GameView({
  engine,
  activeVerb,
  selectedItem,
  debugMode,
  onObjectClick,
  onBackClick,
  onEmptyClick,
  onCycleVerb,
}: GameViewProps) {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const prevViewRef = useRef<string | null>(null);

  useEffect(() => { injectAnimationStyles(); }, []);

  const currentViewId = engine.getCurrentView().id;
  useEffect(() => {
    if (prevViewRef.current !== null && prevViewRef.current !== currentViewId) {
      setTransitioning(true);
      const timer = setTimeout(() => setTransitioning(false), 500);
      prevViewRef.current = currentViewId;
      return () => clearTimeout(timer);
    }
    prevViewRef.current = currentViewId;
  }, [currentViewId]);

  const view = engine.getCurrentView();
  const objects = engine.getVisibleObjects();
  const viewStack = engine.getViewStack();
  const bgColor = engine.getBackgroundColor();
  const bgFile = engine.getBackgroundFile();
  const scenarioId = engine.getScenario().metadata.id;
  const cursor = selectedItem
    ? "url('/cursors/use_item.png') 15 15, crosshair"
    : VERB_CURSORS[activeVerb] ?? 'default';

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

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (onCycleVerb) onCycleVerb();
  };

  return (
    <div
      style={{
        ...styles.viewport,
        backgroundColor: bgColor,
        cursor,
      }}
      onClick={handleViewportClick}
      onContextMenu={handleContextMenu}
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
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Canvas-based ambient lighting */}
      <AmbientCanvas viewId={view.id} width={VIEW_WIDTH} height={VIEW_HEIGHT} />

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
        const showGlint = animation === 'glimmer' && !isHovered;
        const showGlow = animation === 'pulse' && !isHovered;
        return (
          <div
            key={obj.id}
            data-object-hotspot
            style={{
              ...hotspotStyle,
              zIndex: isNav ? 2 : 1,
              overflow: 'visible',
            }}
            onClick={() => onObjectClick(obj.id)}
            onMouseEnter={() => setHoveredObject(obj.id)}
            onMouseLeave={() => setHoveredObject(null)}
          >
            {showGlint && (
              <div style={{ position: 'absolute', top: '30%', left: '40%', width: '0px', height: '0px', pointerEvents: 'none', animation: 'glint-flash 8s ease-in-out infinite' }}>
                <div style={{
                  position: 'absolute', top: '-6px', left: '-1px', width: '2px', height: '12px',
                  background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.95), transparent)',
                }} />
                <div style={{
                  position: 'absolute', top: '-1px', left: '-6px', width: '12px', height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
                }} />
                <div style={{
                  position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px',
                  transform: 'rotate(45deg)',
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,230,255,0.7) 40%, transparent 70%)',
                }} />
                <div style={{
                  position: 'absolute', top: '-8px', left: '-8px', width: '16px', height: '16px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(200,220,255,0.3) 0%, transparent 70%)',
                }} />
              </div>
            )}
            {showGlow && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '6px',
                  height: '6px',
                  marginTop: '-3px',
                  marginLeft: '-3px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(140,220,180,0.8) 0%, rgba(100,200,150,0.3) 40%, transparent 70%)',
                  boxShadow: '0 0 8px 4px rgba(100,200,150,0.2)',
                  animation: 'screen-glow 4s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isHovered && debugMode && <div style={styles.objectLabel}>{obj.visual.label}</div>}
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

      {/* Room transition overlay */}
      {transitioning && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            animation: 'room-transition 500ms ease-in-out forwards',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      )}
    </div>
  );
}
