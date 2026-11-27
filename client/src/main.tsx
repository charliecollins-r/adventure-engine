import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'
import { installAudioBus, playingCount, playingSources } from './audioBus'

installAudioBus();
(window as unknown as Record<string, unknown>).__audioPlaying = playingCount;
(window as unknown as Record<string, unknown>).__audioSources = playingSources;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
