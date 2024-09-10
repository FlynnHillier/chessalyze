import { LobbyInstance } from "~/lib/game/LobbyInstance";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";
import { UUID } from "~/types/common.types";

/**
 * Manages references to LobbyInstance classes.
 *
 * Singleton class.
 */
export class LobbyMaster {
  /**
   * Singleton reference
   */
  private static _instance: LobbyMaster;

  /**
   * Map lobby id's against lobby instance
   */
  private lobbyInstances: Map<UUID, LobbyInstance> = new Map();

  /**
   * Map player id's against their lobby instances
   */
  private playerLobbyInstances: Map<UUID, LobbyInstance> = new Map();

  /**
   * Map player id's agasint any incoming invites
   */
  private playerLobbyIncomingInvites: Map<UUID, Set<UUID>> = new Map();

  private constructor() {}

  /**
   * singleton reference
   * @returns LobbyMaster
   */
  public static instance(): LobbyMaster {
    return this._instance ?? (this._instance = new this());
  }

  /**
   * Get LobbyInstance related to specified lobby id
   *
   * @param lobbyID lobby id of LobbyInstance
   * @returns LobbyInstance | null
   */
  public get(lobbyID: UUID): LobbyInstance | null {
    return this.lobbyInstances.get(lobbyID) ?? null;
  }

  /**
   * Get LobbyInstance related to specified player
   *
   * @param playerID player id
   * @returns LobbyInstance | null
   */
  public getByPlayer(playerID: UUID): LobbyInstance | null {
    return this.playerLobbyInstances.get(playerID) ?? null;
  }

  /**
   * Get ID's of lobby's a player is invited to
   *
   * @param playerID player id
   * @returns string[]
   */
  public getPlayerIncomingInvites(playerID: UUID): string[] {
    return Array.from(this.playerLobbyIncomingInvites.get(playerID) ?? []);
  }

  public _events = {
    /**
     * Ran when lobby is created
     */
    onCreate: ((lobby: LobbyInstance) => {
      logDev({
        message: [
          `creating lobby for player ${lobby.player.pid}.`,
          `id: ${lobby.id}`,
        ],
        color: loggingColourCode.FgGreen,
        category: loggingCategories.lobby,
      });
      this.lobbyInstances.set(lobby.id, lobby);
      this.playerLobbyInstances.set(lobby.player.pid, lobby);
    }).bind(this),

    /**
     * Ran when lobby is ended
     */
    onEnd: ((lobby: LobbyInstance) => {
      logDev({
        message: [`ending lobby`, `id: ${lobby.id}`],
        color: loggingColourCode.FgYellow,
        category: loggingCategories.lobby,
      });
      this.lobbyInstances.delete(lobby.id);
      this.playerLobbyInstances.delete(lobby.player.pid);
      lobby.getInvited().forEach((pid) => {
        this.playerLobbyIncomingInvites.get(pid)?.delete(lobby.id);
      });
    }).bind(this),
    onPlayerInvited: ((lobbyID: string, playerID: string) => {
      const invitedToTheseLobbys =
        this.playerLobbyIncomingInvites.get(playerID) ?? new Set();

      invitedToTheseLobbys.add(lobbyID);
      this.playerLobbyIncomingInvites.set(playerID, invitedToTheseLobbys);
    }).bind(this),
    onPlayerUnInvited: (lobbyID: string, playerID: string) => {
      this.playerLobbyIncomingInvites.get(playerID)?.delete(lobbyID);
    },
  };
}
