import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RoomScene } from './scenes/RoomScene';
import type { GameState } from '../types/messages';
import { MessageType } from '../types/messages';
import { WebSocketClient } from '../network/WebSocketClient';

interface GameCanvasProps {
  gameState: GameState | null;
  wsClient: WebSocketClient;
  playerId: string;
}

export function GameCanvas({ gameState, wsClient, playerId }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<RoomScene | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 1024,
      height: 768,
      parent: containerRef.current,
      transparent: false,
      scene: [RoomScene],
      physics: { default: 'arcade' },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('ready', () => {
      const scene = game.scene.getScene('RoomScene') as RoomScene;
      scene.scene.start('RoomScene', {
        sendMove: (x: number, y: number) => {
          wsClient.send({
            type: MessageType.PLAYER_MOVE,
            payload: { x, y, playerId },
          });
        },
        sendInteract: (objectId: string) => {
          wsClient.send({
            type: MessageType.PLAYER_INTERACT,
            payload: { objectId, playerId },
          });
        },
        playerId,
      });

      scene.events.on('create', () => {
        sceneRef.current = scene;
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [wsClient, playerId]);

  useEffect(() => {
    if (sceneRef.current && gameState) {
      sceneRef.current.updateFromState(gameState);
    }
  }, [gameState]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '1024px',
        height: '768px',
        margin: '0 auto',
        border: '2px solid #6b4226',
        borderRadius: '4px',
      }}
    />
  );
}
