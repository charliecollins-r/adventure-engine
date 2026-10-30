import { useState, type CSSProperties } from 'react';
import type { Item } from '../engine/types';

interface InventoryPanelProps {
  items: Item[];
  selectedItem: string | null;
  onItemSelect: (itemId: string) => void;
  onItemExamine: (itemId: string) => void;
}

const styles: Record<string, CSSProperties> = {
  panel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    backgroundColor: '#151510',
    borderTop: '1px solid #2a2018',
    overflowX: 'auto',
    minHeight: '44px',
  },
  label: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#6a5a3a',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginRight: '8px',
    flexShrink: 0,
  },
  empty: {
    fontSize: '12px',
    fontFamily: '"Georgia", serif',
    color: '#4a3a2a',
    fontStyle: 'italic',
  },
};

function itemStyle(selected: boolean, hovered: boolean): CSSProperties {
  return {
    padding: '4px 12px',
    fontSize: '12px',
    fontFamily: '"Georgia", serif',
    color: selected ? '#e0c040' : '#c0a030',
    backgroundColor: selected ? '#2a2218' : hovered ? '#201a10' : '#1a1810',
    border: selected ? '1px solid #c0a030' : '1px solid #2a2218',
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
  onItemSelect,
  onItemExamine,
}: InventoryPanelProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={styles.panel}>
      <span style={styles.label}>Items</span>
      {items.length === 0 && <span style={styles.empty}>Empty</span>}
      {items.map((item) => (
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
          {item.name}
        </button>
      ))}
    </div>
  );
}
