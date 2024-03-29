import { GameInstance } from "./GameInstance";
import { UUID } from "~/types/common.types";

/**
 * Manages references to GameInstance's
 *
 * singleton class.
 */
export class GameMaster {
  /**
   * Singleton reference
   */
  private static _instance: GameMaster;

  /**
   * Map game id's against game instance
   */
  private gameInstances: Map<UUID, GameInstance> = new Map();

  /**
   * Map player id's against their current game instances
   */
  private playerGameInstances: Map<UUID, GameInstance> = new Map();

  private constructor() {}

  public static instance(): GameMaster {
    return this._instance ?? (this._instance = new this());
  }

  /**
   * Get GameInstance related to specified player
   *
   * @param playerID player id
   * @returns GameInstance | null
   */
  public getByPlayer(playerID: UUID): GameInstance | null {
    return this.playerGameInstances.get(playerID) ?? null;
  }

  /**
   * Get GameInstance related to specified game id
   *
   * @param gameID game id of GameInstance
   * @returns GameInstance | null
   */
  public get(gameID: UUID): GameInstance | null {
    return this.gameInstances.get(gameID) ?? null;
  }

  /**
   * To be used only by GameInstance class internally, used to sync active/ deactive games to GameMaster
   */
  public _events = {
    /**
     * De-register game from game master on end.
     *
     * @param game ended game
     */
    onEnd: ((game: GameInstance) => {
      this.gameInstances.delete(game.id);
      this.playerGameInstances.delete(game.players.w.pid);
      this.playerGameInstances.delete(game.players.b.pid);
    }).bind(this),
    /**
     * Register newly created game to game master.
     *
     * @param game created game
     */
    onCreate: ((game: GameInstance) => {
      this.gameInstances.set(game.id, game);
      this.playerGameInstances.set(game.players.b.pid, game);
      this.playerGameInstances.set(game.players.w.pid, game);
    }).bind(this),
  };
}
