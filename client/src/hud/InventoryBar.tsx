interface InventoryBarProps {
  inventory: string[];
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#1a1a1a',
    border: '2px solid #3a2020',
    borderRadius: '4px',
    margin: '8px auto',
    maxWidth: '1024px',
    minHeight: '48px',
  },
  label: {
    color: '#a08050',
    fontFamily: '"Georgia", serif',
    fontSize: '0.9rem',
    marginRight: '8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: '#111111',
    border: '1px solid #3a2020',
    borderRadius: '4px',
    color: '#e8c87a',
    fontSize: '0.7rem',
    fontFamily: '"Georgia", serif',
    textAlign: 'center' as const,
    padding: '2px',
  },
  empty: {
    color: '#5a4030',
    fontFamily: '"Georgia", serif',
    fontSize: '0.85rem',
    fontStyle: 'italic' as const,
  },
};

export function InventoryBar({ inventory }: InventoryBarProps) {
  return (
    <div style={styles.bar}>
      <span style={styles.label}>Inventory:</span>
      {inventory.length === 0 ? (
        <span style={styles.empty}>Empty</span>
      ) : (
        inventory.map((itemId, index) => (
          <div key={`${itemId}-${index}`} style={styles.item}>
            {itemId}
          </div>
        ))
      )}
    </div>
  );
}
