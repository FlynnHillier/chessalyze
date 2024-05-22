import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { WebSocket } from "ws";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";

class SocketRoomError extends Error {
  constructor(code: string, message?: string) {
    super();
  }
}
class SocketRoomExistsError extends SocketRoomError {
  constructor(roomName: string) {
    super("SOCKET_ROOM_EXISTS", `socket room '${roomName}' already exists`);
  }
}

/**
 * Create and manage a privatised collection of users / specified sockets to receive socket events
 */
export class SocketRoom {
  private registered: {
    users: Set<string>;
    sockets: Set<WebSocket>;
  } = {
    users: new Set(),
    sockets: new Set(),
  };

  constructor({ uids, sockets }: { uids?: string[]; sockets?: [] } = {}) {
    if (uids) this.joinUser(...uids);
    if (sockets) this.joinSocket(...sockets);
  }

  /**
   * Join a user(s) to room
   */
  public joinUser(...uids: string[]) {
    uids.forEach((uid) => this.registered.users.add(uid));
  }

  /**
   * Register socket(s) to room
   *
   */
  public joinSocket(...sockets: WebSocket[]) {
    sockets.forEach((socket) => this.registered.sockets.add(socket));
  }

  /**
   * Disconnect user(s) from room
   */
  public leaveUser(...uids: string[]) {
    uids.forEach((uid) => this.registered.users.delete(uid));
  }

  /**
   * Disconnet socket(s) from room
   *
   */
  public leaveSocket(...sockets: WebSocket[]) {
    sockets.forEach((socket) => this.registered.sockets.delete(socket));
  }

  /**
   * get all relevant socket instances joined to room
   *
   * @returns WebSocket[]
   */
  public sockets(): WebSocket[] {
    const userSockets: WebSocket[] = Array.from(this.registered.users).reduce(
      (sockets, uid) => {
        const newSockets = wsSocketRegistry.get(uid);
        return [...newSockets, ...sockets];
      },
      [] as WebSocket[],
    );

    return Array.from(
      new Set([...userSockets, ...this.registered.sockets.values()]),
    );
  }
}

/**
 * Creates a socket room which is automatically registered to registry.
 */
export class RegisteredSocketRoom extends SocketRoom {
  protected readonly registry: WSRoomRegistry = WSRoomRegistry.instance();
  public readonly name: string;
  public registeredToRegistry: boolean = true;

  public constructor(
    name: string,
    { uids, sockets }: { uids?: string[]; sockets?: [] } = {},
  ) {
    super({ uids, sockets });
    this.name = name;
    this.registry._register(name, this);
  }

  /**
   * Deregister room from wsRoomRegistry
   */
  public deregister() {
    this.registry._deregister(this);
    this.registeredToRegistry = false;
  }

  public joinUser(...uids: string[]) {
    logDev({
      message: `joining users [${uids.join(", ")}] to registered socket room ${this.name}`,
      color: loggingColourCode.FgGreen,
      category: loggingCategories.socket,
    });
    super.joinUser(...uids);
  }
}

/**
 * Allows for abstracted creation/fetching of rooms from the same 'category'.
 *
 * Provides a wrapper around wsRoomRegistry, automatically generating room names based of given data, and using said name to query registry.
 */
export class SocketRoomCategory<A extends object> {
  private readonly _registry: WSRoomRegistry = WSRoomRegistry.instance();
  public readonly prefix: string;
  /**
   * Build a string from args A
   */
  private stringBuilder: (args: A) => string;

  /**
   * @param category identifier used to differenciate room names, this should be unique.
   * @param stringBuilder generates a string given specified args. Used in combination with the category string to generate room name
   */
  public constructor(category: string, stringBuilder: (args: A) => string) {
    this.prefix = `#${category.toLocaleUpperCase()}_`;
    this.stringBuilder = stringBuilder;
  }

  private generateRoomName(args: A) {
    return `${this.prefix}${this.stringBuilder(args)}`;
  }

  public get(args: A): RegisteredSocketRoom | null {
    return this._registry.get(this.generateRoomName(args));
  }

  public getOrCreate(args: A): RegisteredSocketRoom {
    const r = this._registry.getOrCreate(this.generateRoomName(args));

    return r;
  }
}

/**
 * Maintains a reference to all Registered socket rooms.
 *
 */
export class WSRoomRegistry {
  /**
   * singleton reference
   */
  private static _instance: WSRoomRegistry;

  /**
   * Maintains references to created rooms
   * (Rooms should only be instantiated from this method)
   */
  protected rooms: Map<string, RegisteredSocketRoom> = new Map();

  private constructor() {}

  public static instance(): WSRoomRegistry {
    return this._instance ?? (this._instance = new WSRoomRegistry());
  }

  /**
   * get the specified room
   *
   * @param name name of the target room
   * @returns Room | null
   */
  public get(name: string): RegisteredSocketRoom | null {
    return this.rooms.get(name) ?? null;
  }

  /**
   * Get specified room, create room if did not already exist.
   *
   * @param name name of the target room
   * @returns Room
   */
  public getOrCreate(roomName: string): RegisteredSocketRoom {
    const room = this.rooms.get(roomName) ?? new RegisteredSocketRoom(roomName);
    this.rooms.set(roomName, room);
    return room;
  }

  /**
   *  query if room by specified name exists
   *
   * @param roomName target room
   * @returns true if room exists
   */
  public exists(roomName: string): boolean {
    return !!this.rooms.get(roomName);
  }

  /**
   * Registers specified room with specified name, should only be called by RegisteredSocketRoom constructor.
   *
   * Use getOrCreate() if not using RegisteredSocketRoom
   *
   * @param name name of room
   * @param room room to register
   */
  public _register(name: string, room: RegisteredSocketRoom) {
    if (this.exists(name)) throw new SocketRoomExistsError(name);
    logDev({
      message: `registering socket room ${name}`,
      color: loggingColourCode.FgGreen,
      category: loggingCategories.socket,
    });

    this.rooms.set(name, room);
  }

  /**
   * De-registers specified room, should only be called by RegisteredSocketRoom constructor.
   *
   * @param room room to deregister
   */
  public _deregister(room: RegisteredSocketRoom) {
    if (this.rooms.get(room.name) === room) {
      logDev({
        message: `de-registering socket room ${room.name}`,
        color: loggingColourCode.FgYellow,
        category: loggingCategories.socket,
      });
      this.destroy(room.name);
    }
  }

  /**
   *
   */

  /**
   * Destroy specified room if it exists
   * @returns true if room existed
   */
  public destroy(roomName: string): boolean {
    // If any references still exist to specified room elsewhere in project, it will not truly be 'destroyed'

    return this.rooms.delete(roomName);
  }
}
