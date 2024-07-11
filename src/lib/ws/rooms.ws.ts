import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { WebSocket } from "ws";
import { log } from "~/lib/logging/logger.winston";

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

type RegisteredSocketRoomConfig = {
  deregisterOnEmpty?: boolean;
  autoDeregisterAfter?: false | number;
};

type SocketRoomParticipants = { uids?: string[]; sockets?: WebSocket[] };

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

  constructor({
    uids,
    sockets,
  }: { uids?: string[]; sockets?: WebSocket[] } = {}) {
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

  public isEmpty(): boolean {
    return (
      this.registered.users.size === 0 && this.registered.sockets.size === 0
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

  private readonly automatedDeregistrationTimeouts: {
    user: Map<string, NodeJS.Timeout>;
    socket: Map<WebSocket, NodeJS.Timeout>;
  } = {
    user: new Map(),
    socket: new Map(),
  };

  private readonly config: Readonly<Required<RegisteredSocketRoomConfig>>;

  public constructor(
    name: string,
    {
      participants,
      config,
    }: {
      participants?: SocketRoomParticipants;
      config?: RegisteredSocketRoomConfig;
    } = {},
  ) {
    super({ uids: participants?.uids, sockets: participants?.sockets });
    this.name = name;

    this.config = {
      deregisterOnEmpty: config?.deregisterOnEmpty ?? true,
      autoDeregisterAfter: config?.autoDeregisterAfter ?? false,
    };

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
    log("socket").debug(
      `joining users [${uids.join(", ")}] to registered socket room '${this.name}'.`,
    );
    super.joinUser(...uids);

    if (this.config.autoDeregisterAfter !== false)
      uids.forEach((uid) => {
        this.queueAutoDeregisterUser(
          uid,
          this.config.autoDeregisterAfter as number,
        );
      });
  }

  public joinSocket(...sockets: WebSocket[]): void {
    log("socket").debug(
      `joining ${sockets.length} socket(s) to registered socket room '${this.name}'.`,
    );
    super.joinSocket(...sockets);

    if (this.config.autoDeregisterAfter !== false)
      sockets.forEach((socket) => {
        this.queueAutoDeregisterSocket(
          socket,
          this.config.autoDeregisterAfter as number,
        );
      });
  }

  public leaveSocket(...sockets: WebSocket[]): void {
    log("socket").debug(
      `leaving ${sockets.length} socket(s) from registered socket room '${this.name}'.`,
    );
    super.leaveSocket(...sockets);
    if (this.config.deregisterOnEmpty && this.isEmpty()) this.deregister();
  }

  private queueAutoDeregisterUser(uid: string, after: number) {
    const existingTimeout = this.automatedDeregistrationTimeouts.user.get(uid);

    if (existingTimeout) clearTimeout(existingTimeout);

    const newTimeout = setTimeout(() => {
      this.leaveUser(uid);
      this.automatedDeregistrationTimeouts.user.delete(uid);
    }, after);

    this.automatedDeregistrationTimeouts.user.set(uid, newTimeout);
  }

  private queueAutoDeregisterSocket(socket: WebSocket, after: number) {
    const existingTimeout =
      this.automatedDeregistrationTimeouts.socket.get(socket);

    if (existingTimeout) clearTimeout(existingTimeout);

    const newTimeout = setTimeout(() => {
      this.leaveSocket(socket);
      this.automatedDeregistrationTimeouts.socket.delete(socket);
    }, after);

    this.automatedDeregistrationTimeouts.socket.set(socket, newTimeout);
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
  private defaultRoomConfig: RegisteredSocketRoomConfig;

  /**
   * Build a string from args A
   */
  private stringBuilder: (args: A) => string;

  /**
   * @param category identifier used to differenciate room names, this should be unique.
   * @param stringBuilder generates a string given specified args. Used in combination with the category string to generate room name
   */
  public constructor(
    category: string,
    stringBuilder: (args: A) => string,
    defaultRoomConfig: RegisteredSocketRoomConfig = {},
  ) {
    this.prefix = `#${category.toLocaleUpperCase()}_`;
    this.stringBuilder = stringBuilder;
    this.defaultRoomConfig = defaultRoomConfig;
  }

  private generateRoomName(args: A) {
    return `${this.prefix}${this.stringBuilder(args)}`;
  }

  public get(args: A): RegisteredSocketRoom | null {
    return this._registry.get(this.generateRoomName(args));
  }

  public getOrCreate(
    args: A,
    config: RegisteredSocketRoomConfig = {},
  ): RegisteredSocketRoom {
    return this._registry.getOrCreate(this.generateRoomName(args), {
      ...this.defaultRoomConfig,
      ...config,
    });
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
  public getOrCreate(
    roomName: string,
    config: RegisteredSocketRoomConfig = {},
  ): RegisteredSocketRoom {
    const room =
      this.rooms.get(roomName) ??
      new RegisteredSocketRoom(roomName, { config });
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

    log("socket").debug(`registering socket room ${name}`);

    this.rooms.set(name, room);
  }

  /**
   * De-registers specified room, should only be called by RegisteredSocketRoom constructor.
   *
   * @param room room to deregister
   */
  public _deregister(room: RegisteredSocketRoom) {
    if (this.rooms.get(room.name) === room) {
      if (this.destroy(room.name)) {
        log("socket").debug(
          `deregistering registered socket room ${room.name}`,
        );
      }
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
