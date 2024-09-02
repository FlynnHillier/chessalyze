import { UUID } from "~/types/common.types";
import { v1 as uuidv1 } from "uuid";
import { Player, GameTimePreset, BW } from "~/types/game.types";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { GameInstance } from "~/lib/game/GameInstance";
import { getOrCreateLobbySocketRoom } from "~/lib/ws/rooms/categories/lobby.room.ws";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";
import { Color } from "chess.js";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import {
  NonVerboseLobbySnapshot,
  VerboseLobbySnapshot,
} from "~/types/lobby.types";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";

class LobbyError extends Error {
  constructor(code: string, message?: string) {
    super();
  }
}
class LobbyExistsError extends LobbyError {
  constructor(message?: string) {
    super("LOBBY_EXISTS", message);
  }
}

class LobbyJoinError extends LobbyError {
  constructor(message?: string) {
    super("LOBBY_JOIN", message);
  }
}

class InvalidLobbyError extends LobbyError {
  constructor(message?: string) {
    super("LOBBY_INVALID", message);
  }
}

class LobbyAccessibilityError extends LobbyError {
  constructor(message?: string) {
    super("LOBBY_ACCESS_DENIED", message);
  }
}

export type LobbyConfig = Partial<{
  time?: {
    template: GameTimePreset;
  };
  color: {
    preference: Color;
  };
}>;

type Accessibility = {
  allowPublicLink: boolean;
  invited: Set<string>;
};

/**
 * A player lobby
 *
 * Automatically referenced by LobbyMaster on instantiation.
 */
export class LobbyInstance {
  private readonly _lobbyMaster: LobbyMaster = LobbyMaster.instance();

  public readonly player: Player;
  public readonly id: UUID;
  private readonly config: LobbyConfig;
  private accessibility: Accessibility;

  private ended: boolean = false;

  private readonly events = {
    onAccessibilityChange: () => {
      if (
        this.accessibility.invited.size === 0 &&
        this.accessibility.allowPublicLink === false
      )
        this.end();
      else this._emitLobbyUpdateSocketEvent();
    },
    /**
     * Runs on lobby creation
     */
    onCreate: (() => {
      const room = getOrCreateLobbySocketRoom({ id: this.id });
      room.joinUser(this.player.pid);

      wsServerToClientMessage
        .send("LOBBY:UPDATE")
        .data(this.verboseSnapshot())
        .to({ room })
        .emit();

      this._lobbyMaster._events.onCreate(this);
    }).bind(this),

    /**
     * Runs on lobby end
     */
    onEnd: (() => {
      const room = getOrCreateLobbySocketRoom({ id: this.id });

      wsServerToClientMessage.send("LOBBY:END").data({}).to({ room }).emit();

      room.deregister();

      this._lobbyMaster._events.onEnd(this);
    }).bind(this),

    /**
     * Runs on lobby join
     */
    onJoin: ((lobby: LobbyInstance, joining: Player) => {
      logDev({
        message: [
          `player:'${joining.pid}' joining player:'${this.player.pid}' in lobby '${lobby.id}'`,
        ],
        color: loggingColourCode.FgGreen,
        category: loggingCategories.lobby,
      });
    }).bind(this),
  };

  /**
   * Create a player lobby containing specfied player
   *
   * @param player player to inhabit lobby
   */
  public constructor(
    player: Player,

    {
      config,
      accessibility: accessibilty,
    }: Partial<{
      config: Partial<LobbyConfig>;
      accessibility: Partial<Accessibility>;
    }> = {},
  ) {
    if (this._lobbyMaster.getByPlayer(player.pid))
      throw new LobbyExistsError(
        "Unable to create new lobby, player is already in one.",
      );

    this.id = uuidv1();
    this.player = player;
    this.config = config ?? {};

    this.accessibility = {
      allowPublicLink: false,
      invited: new Set(),
      ...accessibilty,
    };

    this.events.onCreate();
  }

  private validateLobby() {
    if (this.ended)
      throw new InvalidLobbyError(
        "Lobby has ended. No references to this lobby should exist anymore.",
      );
  }

  /**
   * End's lobby and broadcast end event to user's
   */
  public end() {
    this.validateLobby();
    this.ended = true;
    this.events.onEnd();
  }

  public isEnded() {
    return this.ended;
  }

  /**
   * join a player to this lobby and create a new game.
   *
   * ends this lobby, and the joining player's if present.
   *
   * @param player player to join lobby
   */
  public join(player: Player):
    | {
        success: false;
        reason: "ATTEMPT_JOIN_SELF" | "NOT_INVITED";
      }
    | {
        success: true;
        game: GameInstance;
      } {
    this.validateLobby();

    if (player.pid === this.player.pid)
      return {
        success: false,
        reason: "ATTEMPT_JOIN_SELF",
      };

    if (
      !this.accessibility.allowPublicLink &&
      !this.accessibility.invited.has(player.pid)
    )
      return {
        success: false,
        reason: "NOT_INVITED",
      };

    // If joining player is already in a lobby, end that lobby.
    const existingLobby = this._lobbyMaster.getByPlayer(player.pid);
    if (existingLobby) existingLobby.end();
    this.end();

    this.events.onJoin(this, player);

    return {
      success: true,
      game: new GameInstance(
        {
          p1: {
            player: this.player,
            preference: this.config.color?.preference,
          },
          p2: {
            player: player,
            preference: undefined,
          },
        },
        this.config.time,
      ),
    };
  }

  public setAllowPublicLink(allowPublicLink: boolean) {
    if (allowPublicLink !== this.accessibility.allowPublicLink) {
      this.accessibility.allowPublicLink = allowPublicLink;
      this.events.onAccessibilityChange();
    }
  }

  public invitePlayers(...playerIDs: string[]) {
    playerIDs = playerIDs.filter((id) => id !== this.player.pid);

    const notPreviouslyInvited = playerIDs.filter(
      (id) => !this.accessibility.invited.has(id),
    );

    const newInvited = new Set([...this.accessibility.invited, ...playerIDs]);

    this.accessibility.invited = newInvited;

    playerIDs.forEach((pid) => {
      wsServerToClientMessage
        .send("LOBBY:INVITE_RECEIVED")
        .data({
          user: {
            id: this.player.pid,
            username: this.player.username,
            imageURL: this.player.image,
          },
          lobbyPreview: this.nonVerboseSnapshot(),
        })
        .to({
          socket: wsSocketRegistry.get(pid),
        })
        .emit();
    });

    if (notPreviouslyInvited.length > 0) this.events.onAccessibilityChange();
  }

  public revokePlayerInvites(...playerIDs: string[]) {
    const prevSize = this.accessibility.invited.size;

    playerIDs.forEach(this.accessibility.invited.delete);

    if (prevSize !== this.accessibility.invited.size)
      this.events.onAccessibilityChange();
  }

  public playerIsInvited(playerID: string) {
    return this.accessibility.invited.has(playerID);
  }

  public isPublicLinkAllowed() {
    return this.accessibility.allowPublicLink;
  }

  public getConfig() {
    return this.config;
  }

  public getInvited() {
    return Array.from(this.accessibility.invited);
  }

  public nonVerboseSnapshot(): NonVerboseLobbySnapshot {
    return {
      id: this.id,
      config: {
        color: this.config.color && {
          preference: this.config.color.preference,
        },
        time: this.config.time && {
          template: this.config.time.template,
        },
      },
    };
  }

  public verboseSnapshot(): VerboseLobbySnapshot {
    return {
      ...this.nonVerboseSnapshot(),
      accessibility: {
        invited: this.getInvited(),
        isPublicLinkAllowed: this.isPublicLinkAllowed(),
      },
    };
  }

  private _emitLobbyUpdateSocketEvent() {
    wsServerToClientMessage
      .send("LOBBY:UPDATE")
      .data(this.verboseSnapshot())
      .to({
        room: getOrCreateLobbySocketRoom({
          id: this.id,
        }),
      })
      .emit();
  }
}
