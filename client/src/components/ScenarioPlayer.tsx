import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react';
import type { Scenario } from '../engine/types';
import { ScenarioEngine } from '../engine/ScenarioEngine';
import { GameView } from './GameView';
// VerbBar removed — right-click cycles verbs KQ5-style
import { InventoryPanel } from './InventoryPanel';
import { MessagePanel } from './MessagePanel';
import { NoiseIndicator } from './NoiseIndicator';

interface ScenarioPlayerProps {
  scenario: Scenario;
  onExit: () => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d0d0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '8px',
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '960px',
    padding: '8px 0',
    marginBottom: '4px',
  },
  titleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '1rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    letterSpacing: '2px',
  },
  exitButton: {
    padding: '4px 16px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#6a5a3a',
    backgroundColor: 'transparent',
    border: '1px solid #2a2018',
    borderRadius: '3px',
    cursor: 'pointer',
  },
  gameArea: {
    width: '960px',
  },
  gameOver: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  gameOverResult: {
    fontSize: '3.5rem',
    fontFamily: '"Georgia", serif',
    letterSpacing: '6px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  gameOverText: {
    fontSize: '1.1rem',
    fontFamily: '"Georgia", serif',
    color: '#8a7a5a',
    marginBottom: '32px',
    textAlign: 'center',
    maxWidth: '500px',
    lineHeight: '1.6',
  },
  gameOverButtons: {
    display: 'flex',
    gap: '16px',
  },
  gameOverButton: {
    padding: '10px 28px',
    fontSize: '1rem',
    fontFamily: '"Georgia", serif',
    color: '#c0a030',
    backgroundColor: '#2a1a10',
    border: '2px solid #3a2a18',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export function ScenarioPlayer({ scenario, onExit }: ScenarioPlayerProps) {
  const engineRef = useRef<ScenarioEngine>(new ScenarioEngine(scenario));
  const [, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const [activeVerb, setActiveVerb] = useState('look');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const engine = engineRef.current;

  useEffect(() => {
    const raw = scenario.setting.ambient_audio;
    if (!raw) return;

    const files = Array.isArray(raw) ? raw : [raw];
    const scenarioId = scenario.metadata.id;
    const elements: HTMLAudioElement[] = [];

    for (const file of files) {
      const audio = new Audio(`/scenarios/${scenarioId}/${file}`);
      audio.loop = true;
      audio.volume = 0.35;
      audio.play().catch(() => {});
      elements.push(audio);
    }
    audioRefs.current = elements;

    return () => {
      for (const a of elements) {
        a.pause();
        a.src = '';
      }
      audioRefs.current = [];
    };
  }, [scenario]);

  useEffect(() => {
    for (const a of audioRefs.current) {
      a.muted = muted;
    }
  }, [muted]);

  const handleObjectClick = useCallback(
    (objectId: string) => {
      if (selectedItem) {
        engine.interact(objectId, 'use_item', selectedItem);
        setSelectedItem(null);
      } else {
        engine.interact(objectId, activeVerb);
      }
      bump();
    },
    [engine, activeVerb, selectedItem, bump],
  );

  const handleBackClick = useCallback(() => {
    engine.navigateBack();
    bump();
  }, [engine, bump]);

  const handleEmptyClick = useCallback(() => {
    engine.dismissMessages();
    const pick = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];
    if (selectedItem) {
      engine.showMessage(pick([
        "You can't use that here.",
        "There's nothing here to use that on.",
        "That won't work on empty space.",
      ]));
      setSelectedItem(null);
      bump();
    } else {
      const pools: Record<string, string[]> = {
        move: [
          "You can't go that way.",
          "There's no passage there.",
          "That direction leads nowhere.",
          "You don't see an exit there.",
        ],
        look: [
          "You don't see anything noteworthy there.",
          "Nothing catches your eye.",
          "Just the walls of the room.",
          "Nothing unusual in that spot.",
        ],
        hand: [
          "There's nothing to interact with there.",
          "You grasp at nothing.",
          "Your hand finds only empty air.",
          "Nothing useful within reach there.",
        ],
        talk: [
          "There's nobody to talk to there.",
          "You speak into the silence. No reply.",
          "Your words echo back unanswered.",
          "Nobody responds.",
        ],
      };
      const pool = pools[activeVerb] ?? ['Nothing happens.', "That doesn't do anything."];
      engine.showMessage(pick(pool));
      bump();
    }
  }, [engine, activeVerb, selectedItem, bump]);

  const VERB_ORDER = ['look', 'move', 'hand', 'talk'];

  const handleVerbSelect = useCallback(
    (verb: string) => {
      setActiveVerb(verb);
      setSelectedItem(null);
    },
    [],
  );

  const handleCycleVerb = useCallback(() => {
    setActiveVerb((prev) => {
      const idx = VERB_ORDER.indexOf(prev);
      return VERB_ORDER[(idx + 1) % VERB_ORDER.length];
    });
    setSelectedItem(null);
  }, []);

  const handleItemSelect = useCallback(
    (itemId: string) => {
      if (selectedItem && selectedItem !== itemId) {
        engine.combineItems(selectedItem, itemId);
        setSelectedItem(null);
        bump();
      } else if (selectedItem === itemId) {
        setSelectedItem(null);
      } else {
        setSelectedItem(itemId);
        const item = engine.getInventory().find((it) => it.id === itemId);
        if (item) {
          engine.showMessage(item.description);
          bump();
        }
      }
    },
    [engine, selectedItem, bump],
  );

  const handleItemExamine = useCallback(
    (itemId: string) => {
      engine.examineItem(itemId, 'look');
      bump();
    },
    [engine, bump],
  );

  const handleDismiss = useCallback(() => {
    engine.dismissMessages();
    bump();
  }, [engine, bump]);

  const handleRestart = useCallback(() => {
    engineRef.current = new ScenarioEngine(scenario);
    setActiveVerb('look');
    setSelectedItem(null);
    bump();
  }, [scenario, bump]);

  const messages = engine.getMessages();
  const inventory = engine.getInventory();
  const noiseLevel = engine.getNoiseLevel();
  const gameOverResult = engine.getGameOverResult();
  const ambientText = scenario.setting.ambient_text;

  return (
    <div style={styles.container}>
      {/* Title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <div style={styles.title}>{scenario.metadata.title}</div>
          <NoiseIndicator level={noiseLevel} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{
              ...styles.exitButton,
              color: debugMode ? '#e0c040' : '#6a5a3a',
              borderColor: debugMode ? '#6a5a30' : '#2a2018',
            }}
            onClick={() => setDebugMode((d) => !d)}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = '#6a5a30';
            }}
            onMouseLeave={(e) => {
              if (!debugMode) (e.target as HTMLElement).style.borderColor = '#2a2018';
            }}
          >
            {debugMode ? 'Debug ON' : 'Debug'}
          </button>
          {scenario.setting.ambient_audio && (
            <button
              style={styles.exitButton}
              onClick={() => setMuted((m) => !m)}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = '#6a5a30';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = '#2a2018';
              }}
            >
              {muted ? 'Unmute' : 'Mute'}
            </button>
          )}
          <button
            style={styles.exitButton}
            onClick={onExit}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = '#6a5a30';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = '#2a2018';
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Game area */}
      <div style={styles.gameArea}>
        <GameView
          engine={engine}
          activeVerb={activeVerb}
          selectedItem={selectedItem}
          debugMode={debugMode}
          onObjectClick={handleObjectClick}
          onBackClick={handleBackClick}
          onEmptyClick={handleEmptyClick}
          onCycleVerb={handleCycleVerb}
        />
        <MessagePanel messages={messages} ambientText={ambientText} onDismiss={handleDismiss} />
        <InventoryPanel
          items={inventory}
          selectedItem={selectedItem}
          scenarioId={scenario.metadata.id}
          onItemSelect={handleItemSelect}
          onItemExamine={handleItemExamine}
        />
        {/* Right-click cycles verbs KQ5-style — no verb bar needed */}
      </div>

      {/* Game over overlay */}
      {gameOverResult && (
        <div style={styles.gameOver}>
          <div
            style={{
              ...styles.gameOverResult,
              color: gameOverResult.won ? '#44cc44' : '#cc4444',
              textShadow: gameOverResult.won
                ? '0 0 30px rgba(68, 204, 68, 0.4)'
                : '0 0 30px rgba(204, 68, 68, 0.4)',
            }}
          >
            {gameOverResult.won ? 'You Escaped' : 'Game Over'}
          </div>
          <div style={styles.gameOverText}>{gameOverResult.text}</div>
          <div style={styles.gameOverButtons}>
            <button style={styles.gameOverButton} onClick={handleRestart}>
              Play Again
            </button>
            <button style={styles.gameOverButton} onClick={onExit}>
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
