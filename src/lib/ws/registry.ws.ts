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
  private socketsToUsersMap: Map<WebSocket, string> = new Map();
  private _pool: Set<WebSocket> = new Set();

  public get(uid: string): WebSocket[] {
    return Array.from(this.sockets.get(uid) ?? []);
  }

  public register(socket: WebSocket, uid: string): void {
    const sockets = this.sockets.get(uid) ?? new Set();
    sockets.add(socket);

    this.sockets.set(uid, sockets);
    this.socketsToUsersMap.set(socket, uid);

    log("socket").debug(`Registered socket connection for user: ${uid}.`);

    //De-register socket from user on socket close
    socket.on(
      "close",
      (() => {
        this.deregister(uid, socket);
      }).bind(this),
    );
  }

  public deregister(uid: string, socket: WebSocket): boolean {
    const sockets = this.sockets.get(uid);
    const present = !!sockets?.delete(socket);

    const registeredToUser = this.socketsToUsersMap.get(socket);
    if (registeredToUser === uid) this.socketsToUsersMap.delete(socket);

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

  /**
   *
   * @param socket a websocket
   * @returns the id of the user the socket is registered to, null if no user.
   */
  public identifySocket(socket: WebSocket): string | null {
    return this.socketsToUsersMap.get(socket) ?? null;
  }
}

export const wsSocketRegistry = new WSSocketRegistry();
