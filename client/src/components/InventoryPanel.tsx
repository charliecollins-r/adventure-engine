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
        {selected && (
          <span data-using-item style={styles.using}>
            Using <b style={{ color: '#e0c040' }}>{selected.name}</b>: click something in the room, or another item to combine.
          </span>
        )}
        {items.map((item) => {
          const combineTarget = !!selected && selected.id !== item.id;
          return (
          <button
            key={item.id}
            style={itemStyle(selectedItem === item.id, hovered === item.id, combineTarget)}
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
            {combineTarget && <span style={styles.plus} aria-hidden="true">+</span>}
            {item.icon_file ? (
              <img
                src={resolveAsset(scenarioId, item.icon_file)}
                alt={item.name}
                style={{
                  height: '26px',
                  width: 'auto',
                  marginRight: '6px',
                  verticalAlign: 'middle',
                  imageRendering: 'auto',
                  filter: selectedItem === item.id ? 'brightness(1.3)' : 'none',
                }}
              />
            ) : (
              <ItemIcon icon={item.icon} size={22} style={{ marginRight: '4px' }} />
            )}
            {item.name}
          </button>
          );
        })}
        {!selected && showCombineTip && items.length >= 2 && (
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
  tip: { fontSize: '11px', fontFamily: '"Georgia", serif', color: '#6a5a40', fontStyle: 'italic', flexBasis: '100%' },
};
