import { useState, useEffect, useCallback } from 'react';
import { WebSocketClient } from '../network/WebSocketClient';
import type { PlayerState } from '../types/messages';
import { MessageType, CHARACTERS } from '../types/messages';

interface LobbyProps {
  wsClient: WebSocketClient;
  playerId: string;
  onGameStart: () => void;
}

type LobbyMode = 'menu' | 'creating' | 'joining' | 'character_select';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#2c1810',
    color: '#d4a056',
    fontFamily: '"Georgia", "Times New Roman", serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#e8c87a',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  subtitle: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    color: '#a08050',
  },
  card: {
    backgroundColor: '#3d2415',
    border: '2px solid #6b4226',
    borderRadius: '8px',
    padding: '2rem',
    minWidth: '400px',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: '#6b4226',
    color: '#e8c87a',
    border: '2px solid #8b5e3c',
    borderRadius: '4px',
    padding: '12px 32px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontFamily: '"Georgia", serif',
    margin: '8px',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#4a3020',
    color: '#7a6040',
    cursor: 'not-allowed',
    border: '2px solid #5a3a20',
  },
  input: {
    backgroundColor: '#1a0e08',
    color: '#e8c87a',
    border: '2px solid #6b4226',
    borderRadius: '4px',
    padding: '12px 16px',
    fontSize: '1.5rem',
    textAlign: 'center' as const,
    letterSpacing: '4px',
    fontFamily: 'monospace',
    width: '240px',
    textTransform: 'uppercase' as const,
  },
  roomCode: {
    fontSize: '3rem',
    fontFamily: 'monospace',
    letterSpacing: '8px',
    color: '#e8c87a',
    backgroundColor: '#1a0e08',
    padding: '16px 32px',
    borderRadius: '8px',
    border: '2px solid #6b4226',
    margin: '16px 0',
  },
  characterCard: {
    display: 'inline-block',
    backgroundColor: '#1a0e08',
    border: '2px solid #6b4226',
    borderRadius: '8px',
    padding: '20px',
    margin: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '160px',
  },
  characterCardTaken: {
    display: 'inline-block',
    backgroundColor: '#1a0e08',
    border: '2px solid #3a2216',
    borderRadius: '8px',
    padding: '20px',
    margin: '8px',
    cursor: 'not-allowed',
    opacity: 0.5,
    width: '160px',
  },
  characterName: {
    fontSize: '1.2rem',
    marginTop: '8px',
  },
  characterIcon: {
    width: '64px',
    height: '96px',
    margin: '0 auto',
    borderRadius: '4px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#a08050',
    marginBottom: '12px',
  },
  backLink: {
    color: '#8b5e3c',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginTop: '16px',
    textDecoration: 'underline',
  },
  error: {
    color: '#d45050',
    marginTop: '12px',
    fontSize: '0.9rem',
  },
};

export function Lobby({ wsClient, playerId, onGameStart }: LobbyProps) {
  const [mode, setMode] = useState<LobbyMode>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState('');

  const handleMessage = useCallback(
    (message: { type: MessageType; payload: Record<string, unknown> }) => {
      switch (message.type) {
        case MessageType.GAME_STATE: {
          const payload = message.payload as unknown as {
            roomCode?: string;
            players?: Record<string, PlayerState>;
          };
          if (payload.roomCode) setRoomCode(payload.roomCode as string);
          if (payload.players) setPlayers(payload.players);
          break;
        }
        case MessageType.CHARACTER_SELECTED: {
          const payload = message.payload as { players?: Record<string, PlayerState> };
          if (payload.players) setPlayers(payload.players);
          break;
        }
        case MessageType.PLAYER_JOINED: {
          const payload = message.payload as { players?: Record<string, PlayerState> };
          if (payload.players) setPlayers(payload.players);
          break;
        }
        case MessageType.PLAYER_LEFT: {
          const payload = message.payload as { players?: Record<string, PlayerState> };
          if (payload.players) setPlayers(payload.players);
          break;
        }
        case MessageType.ERROR: {
          setError((message.payload as { message?: string }).message || 'An error occurred');
          break;
        }
        default:
          break;
      }
    },
    []
  );

  useEffect(() => {
    wsClient.onMessage = handleMessage;
    return () => {
      wsClient.onMessage = null;
    };
  }, [wsClient, handleMessage]);

  const handleCreateGame = async () => {
    setError('');
    try {
      await wsClient.connect(undefined, playerId);
      wsClient.onMessage = handleMessage;
      wsClient.send({ type: MessageType.CREATE_GAME, payload: { playerId } });
      setIsCreator(true);
      setMode('creating');
    } catch {
      setError('Failed to connect to server');
    }
  };

  const handleJoinGame = async () => {
    setError('');
    if (joinCode.length !== 8) {
      setError('Room code must be 8 characters');
      return;
    }
    try {
      await wsClient.connect(joinCode.toUpperCase(), playerId);
      wsClient.onMessage = handleMessage;
      wsClient.send({
        type: MessageType.JOIN_GAME,
        payload: { roomCode: joinCode.toUpperCase(), playerId },
      });
      setRoomCode(joinCode.toUpperCase());
      setMode('character_select');
    } catch {
      setError('Failed to connect to server');
    }
  };

  const handleSelectCharacter = (characterId: string) => {
    const taken = Object.values(players).some(
      (p) => p.characterId === characterId && p.playerId !== playerId
    );
    if (taken) return;

    wsClient.send({
      type: MessageType.SELECT_CHARACTER,
      payload: { characterId, playerId },
    });
    setSelectedCharacter(characterId);
  };

  const handleStartGame = () => {
    onGameStart();
  };

  const allPlayersReady = Object.values(players).every((p) => p.characterId !== null);
  const playerCount = Object.keys(players).length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>King&apos;s Quest</h1>
      <p style={styles.subtitle}>Cooperative Adventures</p>

      <div style={styles.card}>
        {mode === 'menu' && (
          <>
            <button style={styles.button} onClick={handleCreateGame}>
              Create Game
            </button>
            <br />
            <button style={styles.button} onClick={() => setMode('joining')}>
              Join Game
            </button>
          </>
        )}

        {mode === 'joining' && (
          <>
            <p style={styles.label}>Enter Room Code</p>
            <input
              style={styles.input}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="ABCDEFGH"
              maxLength={8}
            />
            <br />
            <button
              style={joinCode.length === 8 ? styles.button : { ...styles.button, ...styles.buttonDisabled }}
              onClick={handleJoinGame}
              disabled={joinCode.length !== 8}
            >
              Join
            </button>
            <div style={styles.backLink} onClick={() => setMode('menu')}>
              &larr; Back
            </div>
          </>
        )}

        {mode === 'creating' && !selectedCharacter && (
          <>
            <p style={styles.label}>Share this code with a friend</p>
            <div style={styles.roomCode}>{roomCode || '...'}</div>
            <p style={styles.label}>Select Your Character</p>
            {CHARACTERS.map((char) => {
              const taken = Object.values(players).some(
                (p) => p.characterId === char.id && p.playerId !== playerId
              );
              return (
                <div
                  key={char.id}
                  style={taken ? styles.characterCardTaken : styles.characterCard}
                  onClick={() => !taken && handleSelectCharacter(char.id)}
                >
                  <div
                    style={{
                      ...styles.characterIcon,
                      backgroundColor: char.id === 'graham' ? '#4477aa' : '#44aa55',
                    }}
                  />
                  <div style={styles.characterName}>{char.name}</div>
                  {taken && <div style={{ ...styles.label, marginTop: '4px' }}>Taken</div>}
                </div>
              );
            })}
          </>
        )}

        {mode === 'character_select' && !selectedCharacter && (
          <>
            <p style={styles.label}>Room: {roomCode}</p>
            <p style={styles.label}>Select Your Character</p>
            {CHARACTERS.map((char) => {
              const taken = Object.values(players).some(
                (p) => p.characterId === char.id && p.playerId !== playerId
              );
              return (
                <div
                  key={char.id}
                  style={taken ? styles.characterCardTaken : styles.characterCard}
                  onClick={() => !taken && handleSelectCharacter(char.id)}
                >
                  <div
                    style={{
                      ...styles.characterIcon,
                      backgroundColor: char.id === 'graham' ? '#4477aa' : '#44aa55',
                    }}
                  />
                  <div style={styles.characterName}>{char.name}</div>
                  {taken && <div style={{ ...styles.label, marginTop: '4px' }}>Taken</div>}
                </div>
              );
            })}
          </>
        )}

        {selectedCharacter && (
          <>
            <p style={styles.label}>Room: {roomCode}</p>
            <p style={{ color: '#88cc88', marginBottom: '16px' }}>
              Playing as{' '}
              <strong>{CHARACTERS.find((c) => c.id === selectedCharacter)?.name}</strong>
            </p>
            <p style={styles.label}>
              {playerCount}/2 players connected
              {!allPlayersReady && playerCount > 1 && ' — waiting for character selection...'}
            </p>
            {isCreator ? (
              <button
                style={
                  allPlayersReady && playerCount >= 1
                    ? styles.button
                    : { ...styles.button, ...styles.buttonDisabled }
                }
                onClick={handleStartGame}
                disabled={!allPlayersReady || playerCount < 1}
              >
                Start Game
              </button>
            ) : (
              <p style={styles.label}>Waiting for host to start...</p>
            )}
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
