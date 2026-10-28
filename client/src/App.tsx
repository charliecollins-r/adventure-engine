import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Lobby } from './lobby/Lobby';
import { GameCanvas } from './game/GameCanvas';
import { InventoryBar } from './hud/InventoryBar';
import { WebSocketClient } from './network/WebSocketClient';
import type { GameState, GameMessage } from './types/messages';
import { MessageType } from './types/messages';

type AppState = 'lobby' | 'in_game';

function App() {
  const [appState, setAppState] = useState<AppState>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const wsClientRef = useRef<WebSocketClient>(new WebSocketClient());
  const [playerId] = useState(() => crypto.randomUUID());

  const handleGameMessage = useCallback((message: GameMessage) => {
    switch (message.type) {
      case MessageType.GAME_STATE: {
        const state = message.payload as unknown as GameState;
        setGameState(state);
        break;
      }
      case MessageType.INVENTORY_UPDATE: {
        const payload = message.payload as { inventory?: string[] };
        if (payload.inventory) {
          setGameState((prev) =>
            prev ? { ...prev, inventory: payload.inventory! } : prev
          );
        }
        break;
      }
      case MessageType.OBJECT_UPDATE: {
        const payload = message.payload as {
          objectId?: string;
          object?: GameState['sceneObjects'][string];
        };
        if (payload.objectId && payload.object) {
          setGameState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              sceneObjects: {
                ...prev.sceneObjects,
                [payload.objectId!]: payload.object!,
              },
            };
          });
        }
        break;
      }
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (appState === 'in_game') {
      wsClientRef.current.onMessage = handleGameMessage;
    }
  }, [appState, handleGameMessage]);

  const handleGameStart = () => {
    setAppState('in_game');
  };

  return (
    <>
      {appState === 'lobby' && (
        <Lobby
          wsClient={wsClientRef.current}
          playerId={playerId}
          onGameStart={handleGameStart}
        />
      )}
      {appState === 'in_game' && (
        <div style={{ backgroundColor: '#1a0e08', minHeight: '100vh', paddingTop: '16px' }}>
          <GameCanvas
            gameState={gameState}
            wsClient={wsClientRef.current}
            playerId={playerId}
          />
          <InventoryBar inventory={gameState?.inventory ?? []} />
        </div>
      )}
    </>
  );
}

export default App;
