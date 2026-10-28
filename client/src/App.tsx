import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Lobby } from './lobby/Lobby';
import { GameCanvas } from './game/GameCanvas';
import { InventoryBar } from './hud/InventoryBar';
import { WebSocketClient } from './network/WebSocketClient';
import type { GameStateData, GameMessage } from './types/messages';
import { MessageType } from './types/messages';

type AppState = 'lobby' | 'in_game';

const gameOverStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  result: {
    fontSize: '4rem',
    fontFamily: '"Georgia", serif',
    letterSpacing: '8px',
    textTransform: 'uppercase' as const,
    marginBottom: '1rem',
  },
  reason: {
    fontSize: '1.2rem',
    color: '#8a7a5a',
    fontFamily: '"Georgia", serif',
    marginBottom: '2rem',
    textAlign: 'center' as const,
    maxWidth: '500px',
  },
  button: {
    backgroundColor: '#3a2020',
    color: '#c0a030',
    border: '2px solid #5a3030',
    borderRadius: '4px',
    padding: '12px 32px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontFamily: '"Georgia", serif',
  },
};

function App() {
  const [appState, setAppState] = useState<AppState>('lobby');
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [role, setRole] = useState<string>('');
  const [gameOver, setGameOver] = useState<{ winner: string; reason: string } | null>(null);
  const wsClientRef = useRef<WebSocketClient>(new WebSocketClient());
  const sceneRef = useRef<{ showMessage: (text: string) => void } | null>(null);
  const [playerId] = useState(() => crypto.randomUUID());

  const handleGameMessage = useCallback(
    (message: GameMessage) => {
      switch (message.type) {
        case MessageType.GAME_STATE: {
          const state = message.payload as unknown as GameStateData;
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
            object?: GameStateData['sceneObjects'][string];
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
        case MessageType.INTERACTION_RESULT: {
          const payload = message.payload as { message?: string };
          if (payload.message && sceneRef.current) {
            sceneRef.current.showMessage(payload.message);
          }
          break;
        }
        case MessageType.NOISE_ALERT: {
          const payload = message.payload as { noiseLevel?: number };
          if (payload.noiseLevel !== undefined) {
            setGameState((prev) =>
              prev ? { ...prev, noiseLevel: payload.noiseLevel! } : prev
            );
          }
          break;
        }
        case MessageType.GAME_OVER: {
          const payload = message.payload as { winner?: string; reason?: string };
          setGameOver({
            winner: payload.winner || '',
            reason: payload.reason || 'Game Over',
          });
          break;
        }
        default:
          break;
      }
    },
    []
  );

  useEffect(() => {
    if (appState === 'in_game') {
      wsClientRef.current.onMessage = handleGameMessage;
    }
  }, [appState, handleGameMessage]);

  const handleGameStart = (selectedRole: string) => {
    setRole(selectedRole);
    setAppState('in_game');
  };

  const handleBackToLobby = () => {
    setGameOver(null);
    setGameState(null);
    setRole('');
    setAppState('lobby');
    wsClientRef.current.disconnect();
    wsClientRef.current = new WebSocketClient();
  };

  const didWin = gameOver && gameOver.winner === role;

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
        <div style={{ backgroundColor: '#0d0d0d', minHeight: '100vh', paddingTop: '16px' }}>
          <GameCanvas
            gameState={gameState}
            wsClient={wsClientRef.current}
            playerId={playerId}
            role={role}
          />
          <InventoryBar inventory={gameState?.inventory ?? []} />
        </div>
      )}
      {gameOver && (
        <div style={gameOverStyles.overlay}>
          <div
            style={{
              ...gameOverStyles.result,
              color: didWin ? '#44cc44' : '#cc4444',
              textShadow: didWin
                ? '0 0 30px rgba(68, 204, 68, 0.5)'
                : '0 0 30px rgba(204, 68, 68, 0.5)',
            }}
          >
            {didWin ? 'YOU WIN' : 'YOU LOSE'}
          </div>
          <div style={gameOverStyles.reason}>{gameOver.reason}</div>
          <button style={gameOverStyles.button} onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
      )}
    </>
  );
}

export default App;
