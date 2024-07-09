import { WebSocket } from "ws";
import { env } from "~/env";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { log } from "~/lib/logging/logger.winston";

//TODO: Add heartbeat so that

/**
 * Map connected socket instances to whichever user they belong to
 */
class WSSocketRegistry {
  private sockets: Map<string, Set<WebSocket>> = new Map();
  private _pool: Set<WebSocket> = new Set();

  public get(uid: string): WebSocket[] {
    return Array.from(this.sockets.get(uid) ?? []);
  }

  public register(socket: WebSocket, uid: string): void {
    const sockets = this.sockets.get(uid) ?? new Set();
    sockets.add(socket);

    this.sockets.set(uid, sockets);

    log("socket").debug(
      `Registered socket connection for user: ${uid}. Socket id: ${socket.id}`,
    );

    //De-register socket from user on socket close
    socket.on(
      "close",
      (() => {
        this.deregister(uid, socket);
      }).bind(this),
    );

    if (env.NODE_ENV === "development")
      wsServerToClientMessage
        .send("DEV_ID")
        .data({ id: socket.id })
        .to({ socket })
        .emit();
  }

  public deregister(uid: string, socket: WebSocket): boolean {
    const sockets = this.sockets.get(uid);
    const present = !!sockets?.delete(socket);

    log("socket").debug(
      `Deregistered socket connection for user ${uid}. Socket id: ${socket.id}`,
    );

    return present;
  }

  public all(): WebSocket[] {
    return Array.from(this.sockets.values()).reduce((acc, socketSet) => {
      return [...acc, ...Array.from(socketSet)];
    }, [] as WebSocket[]);
  }

  public pool(): WebSocket[] {
    return Array.from(this._pool);
  }
}

export const wsSocketRegistry = new WSSocketRegistry();
