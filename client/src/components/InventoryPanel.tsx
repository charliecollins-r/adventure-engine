import { useState, type CSSProperties } from 'react';
import type { Item } from '../engine/types';
import { ItemIcon } from './ItemIcon';

interface InventoryPanelProps {
  items: Item[];
  selectedItem: string | null;
  scenarioId: string;
  onItemSelect: (itemId: string) => void;
  onItemExamine: (itemId: string) => void;
}

function itemStyle(selected: boolean, hovered: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    fontSize: '12px',
    fontFamily: '"Georgia", serif',
    color: selected ? '#e0c040' : '#c0a030',
    backgroundColor: selected
      ? 'rgba(42, 34, 24, 0.8)'
      : hovered
        ? 'rgba(32, 26, 16, 0.6)'
        : 'transparent',
    border: selected ? '1px solid #c0a030' : '1px solid rgba(42, 34, 24, 0.4)',
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
}: InventoryPanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        overflowX: 'auto',
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
        items.map((item) => (
          <button
            key={item.id}
            style={itemStyle(selectedItem === item.id, hovered === item.id)}
            onClick={() => onItemSelect(item.id)}
            onDoubleClick={() => onItemExamine(item.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onItemExamine(item.id);
            }}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            title={`${item.name} — right-click to examine`}
          >
            {item.icon_file ? (
              <img
                src={`/scenarios/${scenarioId}/${item.icon_file}`}
                alt={item.name}
                style={{
                  height: '28px',
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
        ))
      )}
    </div>
  );
}
