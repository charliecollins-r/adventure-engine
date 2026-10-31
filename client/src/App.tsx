import { useState, useEffect } from 'react';
import './App.css';
import type { Scenario } from './engine/types';
import { ScenarioPlayer } from './components/ScenarioPlayer';

const CAMPAIGN_ID = 'the-harvest';

function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/scenarios/${CAMPAIGN_ID}/scenario.json`)
      .then((r) => r.json())
      .then((data) => setScenario(data as Scenario))
      .catch(() => setError('Failed to load scenario'));
  }, []);

  if (scenario) {
    return <ScenarioPlayer scenario={scenario} onExit={() => setScenario(null)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0d0d0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Georgia", serif',
      color: '#6a5a3a',
    }}>
      {error ?? 'Loading...'}
    </div>
  );
}

export default App;
