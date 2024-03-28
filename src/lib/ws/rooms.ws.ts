import { EmitEvent } from "~/lib/ws/events.ws";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { WebSocket } from "ws";
import { emit } from "~/lib/ws/emit.ws";

/**
 * Create and manage a privatised collection of users to receive socket events
 */
export class Room {
  private participants: Set<string> = new Set();

  constructor(uids?: string[]) {
    if (uids) this.join(...uids);
  }

  /**
   * Join a user(s) to room
   */
  public join(...uids: string[]) {
    uids.forEach((uid) => this.participants.add(uid));
  }

  /**
   * Disconnect user(s) from room
   */
  public leave(...uids: string[]) {
    uids.forEach((uid) => this.participants.delete(uid));
  }

  /**
   * get all relevant socket instances joined to room
   *
   * @returns WebSocket[]
   */
  public sockets(): WebSocket[] {
    const socketInstances: WebSocket[] = Array.from(this.participants).reduce(
      (sockets, uid) => {
        const socket = wsSocketRegistry.get(uid);
        if (!socket) return sockets;
        return [socket, ...sockets];
      },
      [] as WebSocket[],
    );

    return socketInstances;
  }

  /**
   * Emit an event to all socket instances within room
   */
  public emit<T extends EmitEvent>(ee: T): number {
    const sockets = this.sockets();

    sockets.forEach((socket) => {
      emit(socket, ee);
    });

    return sockets.length;
  }
}

class WSRoomRegistry {
  /**
   * Maintains references to created rooms
   * (Rooms should only be instantiated from this method)
   */
  protected rooms: Map<string, Room> = new Map();

  /**
   * get room instance
   */
  public get(room: string): Room | null {
    return this.rooms.get(room) ?? null;
  }

  /**
   * Get room instance, create and return new room if did not exist
   */
  public getOrCreate(room: string): Room {
    const existing = this.rooms.get(room) ?? null;
    if (existing) return existing;

    const created = new Room();
    this.rooms.set(room, created);

    return created;
  }

  /**
   * Destroy specified room if it exists
   * @returns true if room existed
   */
  public destroy(room: string): boolean {
    // If any references still exist to specified room elsewhere in project, it will not truly be 'destroyed'

    return this.rooms.delete(room);
  }
}

export const wsRoomRegistry = new WSRoomRegistry();
