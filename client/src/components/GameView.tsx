import { useState, type CSSProperties } from 'react';
import type { ScenarioEngine } from '../engine/ScenarioEngine';

interface GameViewProps {
  engine: ScenarioEngine;
  activeVerb: string;
  selectedItem: string | null;
  onObjectClick: (objectId: string) => void;
  onBackClick: () => void;
}

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const COORD_SPACE_W = 960;
const COORD_SPACE_H = 720;
const SCALE_X = VIEW_WIDTH / COORD_SPACE_W;
const SCALE_Y = VIEW_HEIGHT / COORD_SPACE_H;

const VERB_CURSORS: Record<string, string> = {
  look: 'help',
  take: 'grab',
  use: 'cell',
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
  color: string,
  hovered: boolean,
  cursor: string,
  hasBackground: boolean,
): CSSProperties {
  return {
    position: 'absolute',
    left: `${x * SCALE_X}px`,
    top: `${y * SCALE_Y}px`,
    width: `${w * SCALE_X}px`,
    height: `${h * SCALE_Y}px`,
    backgroundColor: hasBackground ? 'transparent' : color,
    opacity: hasBackground ? (hovered ? 0.3 : 0) : (hovered ? 0.6 : 0.35),
    border: hovered ? '2px solid #c0a030' : '2px solid transparent',
    borderRadius: '2px',
    cursor,
    transition: 'opacity 0.15s ease, border-color 0.15s ease',
    boxSizing: 'border-box',
  };
}

export function GameView({
  engine,
  activeVerb,
  selectedItem,
  onObjectClick,
  onBackClick,
}: GameViewProps) {
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  const view = engine.getCurrentView();
  const objects = engine.getVisibleObjects();
  const viewStack = engine.getViewStack();
  const bgColor = engine.getBackgroundColor();
  const bgFile = engine.getBackgroundFile();
  const scenarioId = engine.getScenario().metadata.id;
  const cursor = VERB_CURSORS[activeVerb] ?? 'default';

  const cursorLabel = selectedItem
    ? `Use ${engine.getInventory().find((it) => it.id === selectedItem)?.name ?? selectedItem} on...`
    : activeVerb.charAt(0).toUpperCase() + activeVerb.slice(1);

  return (
    <div
      style={{
        ...styles.viewport,
        backgroundColor: bgColor,
        cursor,
      }}
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
        return (
          <div
            key={obj.id}
            style={{
              ...objectHotspotStyle(
                obj.position.x,
                obj.position.y,
                obj.size.width,
                obj.size.height,
                obj.visual.color,
                isHovered,
                cursor,
                !!bgFile,
              ),
              position: 'absolute',
              zIndex: isNav ? 2 : 1,
              border: isHovered
                ? `2px solid ${isNav ? '#4a90d9' : '#c0a030'}`
                : '2px solid transparent',
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
