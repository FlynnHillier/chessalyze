import { Chess, Square, Move, Color, PieceSymbol } from "chess.js";
import { v1 as uuidv1 } from "uuid";

import {
  GameSnapshot,
  GameSummary,
  GameTermination,
  BW,
  Player,
  Movement,
  VerboseMovement,
  DecisiveGameTermination,
  DrawGameTermination,
  GameTimePreset,
} from "~/types/game.types";
import { UUID } from "~/types/common.types";
import { ChessClock } from "~/lib/game/GameClock";
import { GameMaster } from "~/lib/game/GameMaster";
import { getOrCreateGameSocketRoom } from "~/lib/ws/rooms/categories/game.room.ws";
import { AtleastOneKey, ExactlyOneKey } from "~/types/util/util.types";
import { saveGameSummary } from "~/lib/drizzle/transactions/game.drizzle";
import { TIMED_PRESET_MAPPINGS } from "~/constants/game";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { log } from "~/lib/logging/logger.winston";
import { ActivityManager } from "~/lib/social/activity.social";

class GameError extends Error {
  constructor(code: string, message?: string) {
    super();
  }
}
class GameExistsError extends GameError {
  constructor(message?: string) {
    super("GAME_EXISTS", message);
  }
}

class InvalidGameError extends GameError {
  constructor(message?: string) {
    super("GAME_INVALID", message);
  }
}

export type JoiningPlayer = {
  player: Player;
  preference?: Color;
};

/**
 * A player chess game
 */
export class GameInstance {
  private readonly _master: GameMaster = GameMaster.instance();

  public readonly id: UUID;
  public readonly players: BW<Player>;

  private readonly game: Chess = new Chess();
  private terminated: boolean = false;
  private time: {
    isTimed: boolean;
    start: number;
    clock?: {
      initial: {
        template?: GameTimePreset;
        absolute: BW<number>;
      };
      instance: ChessClock;
    };
    lastMove: number;
  };
  private moveHistory: VerboseMovement[] = [];
  private summary: null | GameSummary = null;

  private readonly events = {
    /**
     * Runs on game start
     */
    onStart: (() => {
      log("game").info(
        `started game '${this.id}'. w:'${this.players.w.pid}' & b:'${this.players.b.pid}'`,
      );
      const socketRoom = getOrCreateGameSocketRoom({ id: this.id });
      socketRoom.joinUser(this.players.w.pid, this.players.b.pid);

      ActivityManager._eventHooks.onGameStart(this.players.w.pid, this);
      ActivityManager._eventHooks.onGameStart(this.players.b.pid, this);

      wsServerToClientMessage
        .send("GAME_JOIN")
        .data(this.snapshot())
        .to({ room: socketRoom })
        .emit();
    }).bind(this),

    /**
     * Runs on movement
     */
    onMove: ((move: VerboseMovement) => {
      wsServerToClientMessage
        .send("GAME_MOVE")
        .data(move)
        .to({ room: getOrCreateGameSocketRoom({ id: this.id }) })
        .emit();
    }).bind(this),

    /**
     * Runs on game end
     */
    onEnd: ((summary: GameSummary) => {
      log("game").info(`ending game '${this.id}'`);

      const socketRoom = getOrCreateGameSocketRoom({ id: this.id });

      wsServerToClientMessage
        .send("GAME_END")
        .data(summary)
        .to({ room: socketRoom })
        .emit();

      socketRoom.deregister();

      ActivityManager._eventHooks.onGameEnd(this.players.w.pid);
      ActivityManager._eventHooks.onGameEnd(this.players.b.pid);

      saveGameSummary(summary);

      this._master._events.onEnd(this);
    }).bind(this),
  };

  /**
   * Creates a new game with the specified players.
   *
   * @param players players to be present in the game
   * @param times if specified, represent clock times for players. Default null.
   */
  public constructor(
    players: { p1: JoiningPlayer; p2: JoiningPlayer },
    times?: AtleastOneKey<{
      template: GameTimePreset;
      absolute: BW<number>;
    }>,
  ) {
    const TIME_TEMPLATE: GameTimePreset | null = times?.template ?? null;
    const TIME_ABSOLUTE: BW<number> | null =
      times?.absolute ??
      ((TIME_TEMPLATE && {
        w: TIMED_PRESET_MAPPINGS[TIME_TEMPLATE],
        b: TIMED_PRESET_MAPPINGS[TIME_TEMPLATE],
      }) ||
        null);

    if (
      this._master.getByPlayer(players.p1.player.pid) ||
      this._master.getByPlayer(players.p2.player.pid)
    ) {
      // One or more players is already in a game.
      const inGame = [];
      if (this._master.getByPlayer(players.p1.player.pid))
        inGame.push(players.p1.player.pid);
      if (this._master.getByPlayer(players.p2.player.pid))
        inGame.push(players.p2.player.pid);

      throw new GameExistsError(
        `unable to create game. Player(s) '${inGame.join("' & '")}' is already in game.`,
      );
    }

    this.id = uuidv1();
    this.players = this._generateColorConfiguration(players.p1, players.p2);

    const now = Date.now();
    this.time = {
      isTimed: times !== null,
      start: now,
      lastMove: now,
      clock: TIME_ABSOLUTE
        ? {
            instance: new ChessClock(TIME_ABSOLUTE, (timedOutPerspective) => {
              this.end(
                "timeout",
                this.getOppositePerspective(timedOutPerspective),
              );
            }),
            initial: {
              absolute: TIME_ABSOLUTE,
              template: TIME_TEMPLATE ?? undefined,
            },
          }
        : undefined,
    };

    this._master._events.onCreate(this);

    //TODO: only start clock after both player's first moves or ~10 seconds to prevent disadvantage for slow loading times

    this.time.clock?.instance.start();
    this.events.onStart();
  }

  public snapshot(): GameSnapshot {
    return {
      id: this.id,
      FEN: this.game.fen(),
      players: this.players,
      captured: this.getCaptured(),
      time: {
        start: this.time.start,
        now: Date.now(),
        remaining: this.time.clock?.instance.getDurations(),
        initial: {
          remaining: this.time.clock && {
            w: this.time.clock?.initial.absolute.w,
            b: this.time.clock?.initial.absolute.b,
          },
        },
      },
      moves: this.moveHistory,
    };
  }

  // ###GAME END

  /**
   * End the game by resignation
   *
   * @param color the colour which is resigning
   * @param playerID the id of the player that wishes to resign
   */
  public resign({
    color,
    playerID,
  }: AtleastOneKey<{ color: Color; playerID: string }>) {
    if (playerID)
      return this.end(
        "resignation",
        this.getOppositePerspective(this.getPlayerColor(playerID)),
      );
    if (color)
      return this.end("resignation", this.getOppositePerspective(color));
  }

  private end(termination: GameTermination, victor: Color | null) {
    const now = Date.now();
    const summary: GameSummary = {
      id: this.id,
      players: this.players,
      conclusion: {
        boardState: this.game.fen(),
        termination: termination,
        victor: victor,
      },
      moves: this.moveHistory,
      time: {
        start: this.time.start,
        end: now,
        duration: now - this.time.start,
        clock: this.time.clock && {
          initial: {
            absolute: this.time.clock.initial.absolute,
            template: this.time.clock.initial.template,
          },
          end: {
            absolute: this.time.clock.instance.getDurations(),
          },
        },
      },
    };
    this.time.clock?.instance.stop();
    this.terminated = true;
    this.summary = summary;

    this.events.onEnd(summary);
  }

  private getDecisiveTermination(): DecisiveGameTermination {
    return "checkmate";
  }

  private getDrawTermination(): DrawGameTermination {
    if (this.game.isStalemate()) {
      return "stalemate";
    } else if (this.game.isThreefoldRepetition()) {
      return "3-fold repitition";
    } else if (this.game.isInsufficientMaterial()) {
      return "insufficient material";
    } else {
      return "50 move rule";
    }
  }

  public move(
    sourceSquare: Square,
    targetSquare: Square,
    promotion?: "n" | "b" | "r" | "q",
  ): boolean {
    const now = Date.now();
    const initiator: Color = this.game.turn();

    const moveResult =
      this.game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotion,
      }) === null
        ? false
        : true;

    if (moveResult === false) {
      return false;
    }

    const piece = this.game.get(targetSquare)?.type;

    const movement: Movement = {
      piece: piece,
      source: sourceSquare,
      target: targetSquare,
      promotion: promotion,
    };

    const verboseMovement: VerboseMovement = {
      move: movement,
      fen: this.game.fen(),
      initiator: {
        player: this.players[initiator],
        color: initiator,
      },
      time: {
        sinceStart: now - this.time.start,
        timestamp: now,
        remaining: this.time.clock?.instance.getDurations(),
        moveDuration: now - this.time.lastMove,
      },
      captured: this.getCaptured(),
    };

    this.moveHistory.push(verboseMovement);
    this.time.lastMove = now;

    this.events.onMove(verboseMovement);

    if (this.game.isDraw()) {
      this.end(this.getDrawTermination(), null);
    } else if (this.game.isGameOver()) {
      this.end(
        this.getDecisiveTermination(),
        this.getOppositePerspective(this.game.turn()),
      );
    }

    if (this.time.isTimed && !this.terminated) {
      this.time.clock?.instance.switch();
    }
    return true;
  }

  public getIsTimed() {
    return this.time.isTimed;
  }

  public getTimeData() {
    return this.time;
  }

  public getRemainingTimes() {
    return this.time.clock?.instance.getDurations();
  }

  public getFEN(): string {
    return this.game.fen();
  }

  public getTurn(): Color {
    return this.game.turn();
  }

  /**
   *
   * @returns game move history
   */
  public getMoveHistory(): VerboseMovement[] {
    return this.moveHistory;
  }

  /**
   * Get total time elapsed since game start
   */
  public getTimeSinceStart(): number {
    return Date.now() - this.time.start;
  }

  public getCaptured(): BW<{ [key in PieceSymbol]: number }> {
    const captures: BW<{ [key in PieceSymbol]: number }> = {
      w: {
        n: 0,
        b: 0,
        q: 0,
        r: 0,
        p: 0,
        k: 0,
      },
      b: {
        n: 0,
        b: 0,
        q: 0,
        r: 0,
        p: 0,
        k: 0,
      },
    };

    for (let move of this.game.history({ verbose: true }) as Move[]) {
      if (move.captured) {
        captures[move.color][move.captured]++;
      }
    }

    return captures;
  }

  public getPlayerColor(playerUUID: UUID): Color {
    //unsafe, change in future.
    if (this.players.w.pid === playerUUID) {
      return "w";
    } else {
      return "b";
    }
  }

  public isPlayerTurn(playerUUID: UUID): boolean {
    return this.game.turn() === this.getPlayerColor(playerUUID);
  }

  public isValidMove(
    sourceSquare: Square,
    targetSquare: Square,
    promotion?: "n" | "b" | "r" | "q",
  ) {
    const verboseMoves: Move[] = this.game.moves({ verbose: true }) as Move[];

    return verboseMoves.some((move) => {
      return (
        move.from === sourceSquare &&
        move.to === targetSquare &&
        move.promotion === promotion
      );
    });
  }

  public getSummary() {
    return this.summary;
  }

  private _generateColorConfiguration(
    p1: JoiningPlayer,
    p2: JoiningPlayer,
  ): BW<Player> {
    const nonJoiningPlayers: { p1: Player; p2: Player } = {
      p1: p1.player,
      p2: p2.player,
    };

    if (p2.preference && !p1.preference)
      return p2.preference === "w"
        ? {
            b: nonJoiningPlayers.p1,
            w: nonJoiningPlayers.p2,
          }
        : {
            w: nonJoiningPlayers.p1,
            b: nonJoiningPlayers.p2,
          };

    if (p1.preference && !p2.preference)
      return p1.preference === "w"
        ? {
            w: nonJoiningPlayers.p1,
            b: nonJoiningPlayers.p2,
          }
        : {
            b: nonJoiningPlayers.p1,
            w: nonJoiningPlayers.p2,
          };

    // No player preferences, or both players preferences collide.
    return Math.random() < 0.5
      ? {
          b: nonJoiningPlayers.p1,
          w: nonJoiningPlayers.p2,
        }
      : {
          w: nonJoiningPlayers.p1,
          b: nonJoiningPlayers.p2,
        };
  }

  private getOppositePerspective(p: Color): Color {
    return p === "w" ? "b" : "w";
  }
}
