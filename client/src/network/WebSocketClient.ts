import type { GameMessage } from '../types/messages';

type MessageHandler = (message: GameMessage) => void;
type CloseHandler = (event: CloseEvent) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandler: MessageHandler | null = null;
  private closeHandler: CloseHandler | null = null;
  private readonly url: string;

  constructor(url: string = 'ws://localhost:8080/ws/game') {
    this.url = url;
  }

  connect(roomCode?: string, playerId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let connectUrl = this.url;
      const params: string[] = [];
      if (roomCode) params.push(`roomCode=${encodeURIComponent(roomCode)}`);
      if (playerId) params.push(`playerId=${encodeURIComponent(playerId)}`);
      if (params.length > 0) connectUrl += '?' + params.join('&');

      this.ws = new WebSocket(connectUrl);

      this.ws.onopen = () => resolve();

      this.ws.onerror = () => reject(new Error('WebSocket connection failed'));

      this.ws.onmessage = (event: MessageEvent) => {
        if (this.messageHandler) {
          try {
            const message: GameMessage = JSON.parse(event.data);
            this.messageHandler(message);
          } catch {
            console.error('Failed to parse message:', event.data);
          }
        }
      };

      this.ws.onclose = (event: CloseEvent) => {
        if (this.closeHandler) {
          this.closeHandler(event);
        }
      };
    });
  }

  send(message: GameMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  set onMessage(handler: MessageHandler | null) {
    this.messageHandler = handler;
  }

  set onClose(handler: CloseHandler | null) {
    this.closeHandler = handler;
  }

  get connected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
