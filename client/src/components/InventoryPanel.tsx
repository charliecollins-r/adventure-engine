import { useState, type CSSProperties } from 'react';
import type { Item } from '../engine/types';
import { resolveAsset } from '../engine/assetResolver';
import { ItemIcon } from './ItemIcon';

interface InventoryPanelProps {
  items: Item[];
  selectedItem: string | null;
  scenarioId: string;
  onItemSelect: (itemId: string) => void;
  onItemExamine: (itemId: string) => void;
  /** Show the "click two items to combine" tip (until the player has combined something once). */
  showCombineTip?: boolean;
  /** One item per row (the full-screen column on the right edge). */
  vertical?: boolean;
}

function itemStyle(selected: boolean, hovered: boolean, combineTarget = false): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 9px',
    fontSize: '12px',
    fontFamily: '"Georgia", serif',
    color: selected ? '#e0c040' : '#c0a030',
    backgroundColor: selected
      ? 'rgba(42, 34, 24, 0.8)'
      : hovered
        ? 'rgba(32, 26, 16, 0.6)'
        : 'transparent',
    border: selected ? '1px solid #c0a030' : combineTarget && hovered ? '1px dashed #e0c040' : '1px solid rgba(42, 34, 24, 0.4)',
    borderRadius: '3px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  };
}

export function InventoryPanel({
  items,
  selectedItem,
  scenarioId,
  onItemSelect,
  onItemExamine,
  showCombineTip,
  vertical,
}: InventoryPanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const selected = items.find((it) => it.id === selectedItem) ?? null;

  return (
    <div
      style={{
        // Wrap onto more rows instead of scrolling sideways, so every item is always in view.
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        // many items grow a second column to the left rather than scrolling (a scroll box would clip the names)
        ...(vertical ? { flexDirection: 'column' as const, flexWrap: 'wrap-reverse' as const, alignContent: 'flex-end', alignItems: 'stretch', padding: '6px', gap: '4px', maxHeight: '72vh' } : {}),
      }}
    >
      {items.length === 0 ? (
        <span
          style={{
            fontSize: '12px',
            fontFamily: '"Georgia", serif',
            color: '#4a3a2a',
            fontStyle: 'italic',
          }}
        >
          No items yet
        </span>
      ) : (
        <>
        {selected && !vertical && (
          <span data-using-item style={styles.using}>
            Using <b style={{ color: '#e0c040' }}>{selected.name}</b>: click something in the room, or another item to combine.
          </span>
        )}
        {items.map((item) => {
          const combineTarget = !!selected && selected.id !== item.id;
          return (
          <button
            key={item.id}
            style={{ ...itemStyle(selectedItem === item.id, hovered === item.id, combineTarget), ...(vertical ? {
              position: 'relative', justifyContent: 'center', width: 52, height: 48, padding: 0,
              backgroundColor: selectedItem === item.id ? 'rgba(90, 70, 24, 0.85)' : hovered === item.id ? 'rgba(40, 32, 18, 0.8)' : 'rgba(10, 9, 7, 0.5)',
            } : {}) }}
            onClick={() => onItemSelect(item.id)}
            onDoubleClick={() => onItemExamine(item.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onItemExamine(item.id);
            }}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            title={combineTarget ? `${item.name} — combine with ${selected!.name}` : `${item.name} — right-click to examine`}
            data-combine-target={combineTarget || undefined}
          >
            {combineTarget && <span style={vertical ? { ...styles.plus, position: 'absolute', top: 1, left: 4, margin: 0 } : styles.plus} aria-hidden="true">+</span>}
            {item.icon_file ? (
              <img
                src={resolveAsset(scenarioId, item.icon_file)}
                alt={item.name}
                style={{
                  height: vertical ? '34px' : '26px',
                  width: 'auto',
                  marginRight: vertical ? 0 : '6px',
                  verticalAlign: 'middle',
                  imageRendering: 'auto',
                  filter: selectedItem === item.id ? 'brightness(1.3)' : 'none',
                }}
              />
            ) : (
              <ItemIcon icon={item.icon} size={vertical ? 30 : 22} style={{ marginRight: vertical ? 0 : '4px' }} />
            )}
            {!vertical && item.name}
            {/* the strip shows icons only; the name (and what a click will do) slides out to the left on hover */}
            {vertical && (hovered === item.id || selectedItem === item.id) && (
              <span data-item-label style={styles.flyout}>
                {selectedItem === item.id ? `Using ${item.name}` : combineTarget ? `${item.name}: combine with ${selected!.name}` : item.name}
              </span>
            )}
          </button>
          );
        })}
        {!selected && showCombineTip && items.length >= 2 && !vertical && (
          <span data-combine-tip style={styles.tip}>Click an item to use it. Click two items to combine them.</span>
        )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  using: { fontSize: '12px', fontFamily: '"Georgia", serif', color: '#b8a070', flexBasis: '100%' },
  plus: { color: '#e0c040', fontWeight: 'bold', marginRight: '4px', fontSize: '13px' },
  flyout: {
    position: 'absolute', right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', pointerEvents: 'none',
    background: 'rgba(10, 9, 7, 0.9)', border: '1px solid rgba(120, 100, 60, 0.5)', borderRadius: '4px', padding: '4px 10px',
    fontSize: '13px', fontFamily: '"Georgia", serif', color: '#e0c060',
  },
  tip: { fontSize: '11px', fontFamily: '"Georgia", serif', color: '#6a5a40', fontStyle: 'italic', flexBasis: '100%' },
};
