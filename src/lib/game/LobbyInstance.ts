import { UUID } from "~/types/common.types";
import { v1 as uuidv1 } from "uuid";
import { Player, GameTimePreset, BW } from "~/types/game.types";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { GameInstance } from "~/lib/game/GameInstance";
import { getOrCreateLobbySocketRoom } from "~/lib/ws/rooms/lobby.room.ws";
import { emitLobbyEndEvent } from "~/lib/ws/events/lobby/lobby.end.event.ws";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";
import { Color } from "chess.js";
import { ExactlyOneKey } from "~/types/util/util.types";

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

export type LobbyConfig = Partial<{
  time?: ExactlyOneKey<{
    template: GameTimePreset;
    absolute: BW<number>;
  }>;
  color: {
    preference: Color;
  };
}>;

/**
 * A player lobby
 *
 * Automatically referenced by LobbyMaster on instantiation.
 */
export class LobbyInstance {
  private readonly _lobbyMaster: LobbyMaster = LobbyMaster.instance();

  public readonly player: Player;
  public readonly id: UUID;
  public readonly config: LobbyConfig;

  private readonly events = {
    /**
     * Runs on lobby creation
     */
    onCreate: (() => {
      const room = getOrCreateLobbySocketRoom({ id: this.id });
      room.join(this.player.pid);

      //TODO: maybe emit lobby join event here?

      this._lobbyMaster._events.onCreate(this);
    }).bind(this),

    /**
     * Runs on lobby end
     */
    onEnd: (() => {
      const room = getOrCreateLobbySocketRoom({ id: this.id });

      emitLobbyEndEvent({ room: room }, {});

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

  private ended: boolean = false;

  /**
   * Create a player lobby containing specfied player
   *
   * @param player player to inhabit lobby
   */
  public constructor(player: Player, config: LobbyInstance["config"] = {}) {
    if (this._lobbyMaster.getByPlayer(player.pid))
      throw new LobbyExistsError(
        "Unable to create new lobby, player is already in one.",
      );

    this.id = uuidv1();
    this.player = player;
    this.config = config;

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
    this.events.onEnd();

    //TODO: lobby end emit event
  }

  /**
   * join a player to this lobby and create a new game.
   *
   * ends this lobby, and the joining player's if present.
   *
   * @param player player to join lobby
   */
  public join(player: Player): GameInstance {
    this.validateLobby();

    if (player.pid === this.player.pid)
      throw new LobbyJoinError("Player cannot join their own lobby");

    // If joining player is already in a lobby, end that lobby.
    const existingLobby = this._lobbyMaster.getByPlayer(player.pid);
    if (existingLobby) existingLobby.end();
    this.end();

    this.events.onJoin(this, player);

    return new GameInstance(
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
    );
  }
}
