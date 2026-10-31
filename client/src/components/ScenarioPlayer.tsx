import { useState, useRef, useCallback, useEffect, type CSSProperties } from 'react';
import type { Scenario } from '../engine/types';
import { ScenarioEngine } from '../engine/ScenarioEngine';
import { GameView } from './GameView';
import { IntroSequence } from './IntroSequence';
import { InventoryPanel } from './InventoryPanel';
import { NoiseIndicator } from './NoiseIndicator';
import { CloseupOverlay } from './CloseupOverlay';
import { EyeOpenTransition } from './EyeOpenTransition';

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
    overflowY: 'auto' as const,
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
  chromeButton: {
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
    position: 'relative' as const,
    width: '960px',
    overflow: 'hidden' as const,
  },
  bottomHud: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column' as const,
    pointerEvents: 'none' as const,
  },
  messagePanel: {
    width: '960px',
    padding: '10px 16px',
    backgroundColor: '#0d0d0a',
    borderTop: '1px solid #2a2018',
    cursor: 'pointer',
    maxHeight: '120px',
    overflowY: 'auto' as const,
    boxSizing: 'border-box' as const,
  },
  messageText: {
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    color: '#e0d0a0',
    lineHeight: '1.6',
    margin: '0 0 4px',
  },
  dismissHint: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#3a3020',
    textAlign: 'right' as const,
    marginTop: '4px',
  },
  ambientPanel: {
    width: '960px',
    padding: '8px 16px',
    fontSize: '13px',
    fontFamily: '"Georgia", serif',
    color: 'rgba(90, 74, 48, 0.5)',
    fontStyle: 'italic',
    backgroundColor: '#0d0d0a',
    boxSizing: 'border-box' as const,
  },
  tabRow: {
    display: 'flex',
    justifyContent: 'space-between',
    pointerEvents: 'none' as const,
    padding: '0 4px',
  },
  inventoryTab: {
    pointerEvents: 'auto' as const,
    padding: '3px 12px',
    fontSize: '11px',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(13, 13, 10, 0.6)',
    border: 'none',
    borderRadius: '0 0 3px 3px',
    cursor: 'pointer',
    letterSpacing: '1px',
    transition: 'color 0.2s ease',
  },
  hintTab: {
    pointerEvents: 'auto' as const,
    padding: '3px 10px',
    fontSize: '14px',
    fontFamily: '"Georgia", serif',
    backgroundColor: 'rgba(13, 13, 10, 0.6)',
    border: 'none',
    borderRadius: '0 0 3px 3px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  gameOver: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  gameOverResult: {
    fontSize: '3.5rem',
    fontFamily: '"Georgia", serif',
    letterSpacing: '6px',
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  gameOverText: {
    fontSize: '1.1rem',
    fontFamily: '"Georgia", serif',
    color: '#8a7a5a',
    marginBottom: '32px',
    textAlign: 'center' as const,
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

  const [showIntro, setShowIntro] = useState(() => !!scenario.setting.intro_text?.length);
  const [eyeOpen, setEyeOpen] = useState(false);
  const [activeVerb, setActiveVerb] = useState('look');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  const engine = engineRef.current;

  useEffect(() => {
    if (!showIntro && !eyeOpen) {
      const timer = setTimeout(() => setEyeOpen(true), 50);
      return () => clearTimeout(timer);
    }
  }, [showIntro, eyeOpen]);

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

  const scenarioId = scenario.metadata.id;

  const playSound = useCallback(
    (file: string) => {
      if (muted) return;
      const audio = new Audio(`/scenarios/${scenarioId}/${file}`);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    },
    [scenarioId, muted],
  );

  const playPendingSounds = useCallback(() => {
    const sounds = engine.getPendingSounds();
    for (const s of sounds) playSound(s);
    engine.clearPendingSounds();
  }, [engine, playSound]);

  const prevViewRef = useRef(engine.currentViewId);
  useEffect(() => {
    const currentView = engine.currentViewId;
    if (prevViewRef.current !== currentView) {
      playSound('audio/door_open_close.wav');
      prevViewRef.current = currentView;
    }
  });

  const prevItemCount = useRef(-1);
  useEffect(() => {
    const count = engine.getInventory().length;
    if (prevItemCount.current >= 0 && count > prevItemCount.current) {
      setInventoryOpen(true);
      playSound('audio/item_pickup.wav');
    }
    prevItemCount.current = count;
  });

  const handleObjectClick = useCallback(
    (objectId: string) => {
      if (selectedItem) {
        engine.interact(objectId, 'use_item', selectedItem);
        setSelectedItem(null);
      } else {
        engine.interact(objectId, activeVerb);
      }
      playPendingSounds();
      bump();
    },
    [engine, activeVerb, selectedItem, bump, playPendingSounds],
  );

  const handleEmptyClick = useCallback(() => {
    engine.dismissMessages();
    const pick = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];
    if (selectedItem) {
      engine.showMessage(
        pick([
          "You can't use that here.",
          "There's nothing here to use that on.",
          "That won't work on empty space.",
        ]),
      );
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
        playPendingSounds();
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
    [engine, selectedItem, bump, playPendingSounds],
  );

  const handleItemExamine = useCallback(
    (itemId: string) => {
      engine.examineItem(itemId, 'look');
      playPendingSounds();
      bump();
    },
    [engine, bump, playPendingSounds],
  );

  const handleDismiss = useCallback(() => {
    engine.dismissMessages();
    bump();
  }, [engine, bump]);

  const handleRestart = useCallback(() => {
    engineRef.current = new ScenarioEngine(scenario);
    setActiveVerb('look');
    setSelectedItem(null);
    setInventoryOpen(false);
    bump();
  }, [scenario, bump]);

  const handleHint = useCallback(() => {
    const hint = engine.getHint();
    if (hint) {
      engine.showMessage(hint);
    } else {
      engine.showMessage('No hints available for this room.');
    }
    bump();
  }, [engine, bump]);

  const messages = engine.getMessages();
  const inventory = engine.getInventory();
  const noiseLevel = engine.getNoiseLevel();
  const gameOverResult = engine.getGameOverResult();
  const closeupImage = engine.getCloseupImage();
  const ambientText = scenario.setting.ambient_text;

  const handleCloseupDismiss = useCallback(() => {
    engine.dismissCloseup();
    bump();
  }, [engine, bump]);

  if (showIntro && scenario.setting.intro_text?.length) {
    return (
      <IntroSequence
        pages={scenario.setting.intro_text}
        title={scenario.metadata.title}
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Minimal title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleLeft}>
          <div style={styles.title}>{scenario.metadata.title}</div>
          <NoiseIndicator level={noiseLevel} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{
              ...styles.chromeButton,
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
              style={styles.chromeButton}
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
            style={styles.chromeButton}
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

      {/* Game viewport with HUD overlays */}
      <div style={styles.gameArea}>
        <GameView
          engine={engine}
          activeVerb={activeVerb}
          selectedItem={selectedItem}
          debugMode={debugMode}
          onObjectClick={handleObjectClick}
          onEmptyClick={handleEmptyClick}
          onCycleVerb={handleCycleVerb}
        />

        {/* Bottom HUD overlay */}
        <div style={styles.bottomHud}>
          {/* Collapsible inventory tray */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: inventoryOpen ? '54px' : '0',
              transition: 'max-height 0.3s ease',
              pointerEvents: 'auto' as const,
              backgroundColor: 'rgba(13, 13, 10, 0.92)',
              backdropFilter: 'blur(4px)',
              borderTop: inventoryOpen ? '1px solid rgba(42, 32, 24, 0.4)' : 'none',
            }}
          >
            <InventoryPanel
              items={inventory}
              selectedItem={selectedItem}
              scenarioId={scenario.metadata.id}
              onItemSelect={handleItemSelect}
              onItemExamine={handleItemExamine}
            />
          </div>

          {/* Tab row: inventory toggle + hint */}
          <div style={styles.tabRow}>
            <button
              style={{
                ...styles.inventoryTab,
                color: inventoryOpen ? '#c0a030' : '#5a4a30',
              }}
              onClick={() => setInventoryOpen((o) => !o)}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#c0a030';
              }}
              onMouseLeave={(e) => {
                if (!inventoryOpen) (e.target as HTMLElement).style.color = '#5a4a30';
              }}
            >
              {inventoryOpen ? '▾' : '▸'} Items
              {inventory.length > 0 ? ` (${inventory.length})` : ''}
            </button>
            <button
              style={{ ...styles.hintTab, color: '#5a4a30' }}
              onClick={handleHint}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#c0a030';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#5a4a30';
              }}
            >
              ?
            </button>
          </div>
        </div>

        {/* Eye-open animation scoped to viewport */}
        <EyeOpenTransition active={eyeOpen} />
      </div>

      {/* Text feedback below viewport */}
      {messages.length > 0 ? (
        <div style={styles.messagePanel} onClick={handleDismiss}>
          {messages.map((msg, i) => (
            <p key={i} style={styles.messageText}>
              {msg}
            </p>
          ))}
          <div style={styles.dismissHint}>click to dismiss</div>
        </div>
      ) : ambientText ? (
        <div style={styles.ambientPanel}>{ambientText}</div>
      ) : null}

      {/* Closeup overlay */}
      {closeupImage && (
        <CloseupOverlay
          imageSrc={`/scenarios/${scenario.metadata.id}/${closeupImage}`}
          onClose={handleCloseupDismiss}
        />
      )}

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
