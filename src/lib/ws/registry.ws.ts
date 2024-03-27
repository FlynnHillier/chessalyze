import { WebSocket } from "ws";

/**
 * Map connected socket instances to whichever user they belong to
 */
class WSSocketRegistry {
  private sockets: Map<string, WebSocket> = new Map();

  public get(uid: string): WebSocket | null {
    return this.sockets.get(uid) ?? null;
  }

  public register(uid: string, socket: WebSocket): void {
    this.sockets.set(uid, socket);
  }

  public all(): WebSocket[] {
    return Array.from(this.sockets.values());
  }
}

export const wsSocketRegistry = new WSSocketRegistry();
