import { useState } from 'react';
import './App.css';
import type { Scenario } from './engine/types';
import { ScenarioPlayer } from './components/ScenarioPlayer';
import { ScenarioLoader } from './components/ScenarioLoader';

function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  if (scenario) {
    return <ScenarioPlayer scenario={scenario} onExit={() => setScenario(null)} />;
  }

  return <ScenarioLoader onLoad={setScenario} />;
}

export default App;
