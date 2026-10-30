import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Scenario } from '../engine/types';

interface ScenarioLoaderProps {
  onLoad: (scenario: Scenario) => void;
}

interface ScenarioMeta {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  estimated_minutes?: number;
  loading: boolean;
  error?: string;
}

const SCENARIOS = [
  'the-harvest',
  'the-lighthouse-keeper',
  'the-butchers-debt',
  'the-seance-room',
  'the-taxidermist',
  'pressure-point',
];

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d0d0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
  },
  title: {
    fontSize: '2.4rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    marginBottom: '8px',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '1rem',
    fontFamily: '"Georgia", serif',
    color: '#6a5a3a',
    marginBottom: '48px',
    fontStyle: 'italic',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    width: '100%',
    maxWidth: '960px',
    marginBottom: '32px',
  },
  cardBase: {
    padding: '20px',
    backgroundColor: '#151210',
    border: '1px solid #2a2018',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontFamily: '"Georgia", serif',
    color: '#e0d0a0',
    marginBottom: '8px',
  },
  cardDescription: {
    fontSize: '0.85rem',
    fontFamily: '"Georgia", serif',
    color: '#8a7a5a',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  cardMeta: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#5a4a30',
  },
  uploadArea: {
    width: '100%',
    maxWidth: '960px',
    display: 'flex',
    justifyContent: 'center',
  },
  uploadButton: {
    padding: '10px 28px',
    fontSize: '0.9rem',
    fontFamily: '"Georgia", serif',
    color: '#8a7a5a',
    backgroundColor: '#151210',
    border: '1px dashed #3a2a18',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loadingCard: {
    color: '#5a4a30',
    fontFamily: '"Georgia", serif',
    fontStyle: 'italic',
    fontSize: '0.85rem',
  },
};

export function ScenarioLoader({ onLoad }: ScenarioLoaderProps) {
  const [metas, setMetas] = useState<ScenarioMeta[]>(
    SCENARIOS.map((id) => ({
      id,
      title: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: '',
      loading: true,
    })),
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    SCENARIOS.forEach((id) => {
      fetch(`/scenarios/${id}.json`)
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
  }, []);

  const handleCardClick = async (id: string) => {
    if (loadingId) return;
    setLoadingId(id);
    try {
      const r = await fetch(`/scenarios/${id}.json`);
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

  return (
    <div style={styles.container}>
      <div style={styles.title}>Adventure Engine</div>
      <div style={styles.subtitle}>Select a scenario to play</div>

      <div style={styles.grid}>
        {metas.map((meta) => (
          <div
            key={meta.id}
            style={{
              ...styles.cardBase,
              borderColor:
                hovered === meta.id ? '#c0a030' : loadingId === meta.id ? '#6a5a30' : '#2a2018',
              backgroundColor: hovered === meta.id ? '#1a1510' : '#151210',
              opacity: meta.error ? 0.4 : 1,
              pointerEvents: meta.error || loadingId ? 'none' : 'auto',
            }}
            onClick={() => handleCardClick(meta.id)}
            onMouseEnter={() => setHovered(meta.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={styles.cardTitle}>{meta.title}</div>
            {meta.loading ? (
              <div style={styles.loadingCard}>Loading...</div>
            ) : meta.error ? (
              <div style={styles.loadingCard}>{meta.error}</div>
            ) : (
              <>
                <div style={styles.cardDescription}>
                  {meta.description.length > 150
                    ? meta.description.slice(0, 150) + '...'
                    : meta.description}
                </div>
                <div style={styles.cardMeta}>
                  {meta.difficulty && <span>{meta.difficulty}</span>}
                  {meta.estimated_minutes && <span> · ~{meta.estimated_minutes} min</span>}
                </div>
              </>
            )}
            {loadingId === meta.id && <div style={styles.loadingCard}>Loading scenario...</div>}
          </div>
        ))}
      </div>

      <div style={styles.uploadArea}>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          style={styles.uploadButton}
          onClick={() => fileRef.current?.click()}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.borderColor = '#6a5a30';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.borderColor = '#3a2a18';
          }}
        >
          Load Custom Scenario (JSON)
        </button>
      </div>
    </div>
  );
}
