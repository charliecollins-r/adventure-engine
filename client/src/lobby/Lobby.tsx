import { useState, useEffect, useCallback } from 'react';
import { WebSocketClient } from '../network/WebSocketClient';
import type { PlayerState } from '../types/messages';
import { MessageType, ROLES } from '../types/messages';

interface LobbyProps {
  wsClient: WebSocketClient;
  playerId: string;
  onGameStart: (role: string) => void;
}

type LobbyMode = 'menu' | 'creating' | 'joining' | 'role_select';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0d0d0d',
    color: '#a09040',
    fontFamily: '"Georgia", "Times New Roman", serif',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '0.25rem',
    color: '#c0a030',
    textShadow: '2px 2px 8px rgba(139, 32, 32, 0.5)',
    letterSpacing: '6px',
    textTransform: 'uppercase' as const,
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '2rem',
    color: '#6a5a4a',
    letterSpacing: '2px',
  },
  card: {
    backgroundColor: '#1a1a1a',
    border: '2px solid #3a2020',
    borderRadius: '8px',
    padding: '2rem',
    minWidth: '440px',
    textAlign: 'center' as const,
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
    margin: '8px',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#2a1515',
    color: '#5a4a30',
    cursor: 'not-allowed',
    border: '2px solid #3a2020',
  },
  input: {
    backgroundColor: '#111111',
    color: '#c0a030',
    border: '2px solid #3a2020',
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
    color: '#c0a030',
    backgroundColor: '#111111',
    padding: '16px 32px',
    borderRadius: '8px',
    border: '2px solid #3a2020',
    margin: '16px 0',
  },
  roleCard: {
    display: 'inline-block',
    backgroundColor: '#111111',
    border: '2px solid #3a3030',
    borderRadius: '8px',
    padding: '20px',
    margin: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '180px',
    verticalAlign: 'top',
  },
  roleCardTaken: {
    display: 'inline-block',
    backgroundColor: '#111111',
    border: '2px solid #2a1a1a',
    borderRadius: '8px',
    padding: '20px',
    margin: '8px',
    cursor: 'not-allowed',
    opacity: 0.4,
    width: '180px',
    verticalAlign: 'top',
  },
  roleName: {
    fontSize: '1.2rem',
    marginTop: '8px',
    color: '#c0a030',
  },
  roleDescription: {
    fontSize: '0.8rem',
    marginTop: '6px',
    color: '#6a5a4a',
    lineHeight: '1.3',
  },
  roleIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto',
    borderRadius: '4px',
  },
  label: {
    fontSize: '0.9rem',
    color: '#6a5a4a',
    marginBottom: '12px',
  },
  backLink: {
    color: '#5a3030',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginTop: '16px',
    textDecoration: 'underline',
  },
  error: {
    color: '#cc4040',
    marginTop: '12px',
    fontSize: '0.9rem',
  },
};

export function Lobby({ wsClient, playerId, onGameStart }: LobbyProps) {
  const [mode, setMode] = useState<LobbyMode>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
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
        case MessageType.PLAYER_JOINED:
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
      setMode('role_select');
    } catch {
      setError('Failed to connect to server');
    }
  };

  const handleSelectRole = (roleId: string) => {
    const taken = Object.values(players).some(
      (p) => p.roleId === roleId && p.playerId !== playerId
    );
    if (taken) return;

    wsClient.send({
      type: MessageType.SELECT_ROLE,
      payload: { roleId, playerId },
    });
    setSelectedRole(roleId);
  };

  const handleStartGame = () => {
    if (selectedRole) {
      onGameStart(selectedRole);
    }
  };

  const allPlayersReady = Object.values(players).every((p) => p.roleId !== null);
  const playerCount = Object.keys(players).length;

  const renderRoleCards = () => (
    <>
      {ROLES.map((role) => {
        const taken = Object.values(players).some(
          (p) => p.roleId === role.id && p.playerId !== playerId
        );
        const iconColor = role.id === 'captive' ? '#2a4a6a' : '#6a2a2a';
        const borderHover = role.id === 'captive' ? '#4a6a8a' : '#8a3a3a';
        return (
          <div
            key={role.id}
            style={{
              ...(taken ? styles.roleCardTaken : styles.roleCard),
              borderColor: taken ? undefined : borderHover,
            }}
            onClick={() => !taken && handleSelectRole(role.id)}
          >
            <div
              style={{
                ...styles.roleIcon,
                backgroundColor: iconColor,
                border: `2px solid ${borderHover}`,
              }}
            />
            <div style={styles.roleName}>{role.name}</div>
            <div style={styles.roleDescription}>{role.description}</div>
            {taken && <div style={{ ...styles.label, marginTop: '4px', color: '#cc4040' }}>Taken</div>}
          </div>
        );
      })}
    </>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Adventure Engine</h1>
      <p style={styles.subtitle}>JSON-Driven Point-and-Click Adventures</p>

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

        {mode === 'creating' && !selectedRole && (
          <>
            <p style={styles.label}>Share this code with your opponent</p>
            <div style={styles.roomCode}>{roomCode || '...'}</div>
            <p style={styles.label}>Choose Your Role</p>
            {renderRoleCards()}
          </>
        )}

        {mode === 'role_select' && !selectedRole && (
          <>
            <p style={styles.label}>Room: {roomCode}</p>
            <p style={styles.label}>Choose Your Role</p>
            {renderRoleCards()}
          </>
        )}

        {selectedRole && (
          <>
            <p style={styles.label}>Room: {roomCode}</p>
            <p style={{ color: selectedRole === 'captive' ? '#5588bb' : '#bb5555', marginBottom: '16px' }}>
              Playing as{' '}
              <strong>{ROLES.find((r) => r.id === selectedRole)?.name}</strong>
            </p>
            <p style={styles.label}>
              {playerCount}/2 players connected
              {!allPlayersReady && playerCount > 1 && ' — waiting for role selection...'}
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
