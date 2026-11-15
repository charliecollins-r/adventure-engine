import { useState } from 'react';
import './App.css';
import type { Scenario } from './engine/types';
import { ScenarioPlayer } from './components/ScenarioPlayer';
import { ScenarioLoader } from './components/ScenarioLoader';

function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  // The menu may jump straight into a game on the first visit only (?play=<id>, ?dev …); leaving a game shows it.
  const [firstVisit, setFirstVisit] = useState(true);

  if (scenario) {
    return <ScenarioPlayer scenario={scenario} onExit={() => { setFirstVisit(false); setScenario(null); }} />;
  }

  return <ScenarioLoader onLoad={setScenario} autoLaunch={firstVisit} />;
}

export default App;
