import { Chess, Square, Move, Color, PieceSymbol } from "chess.js";
import { v1 as uuidv1 } from "uuid";
import { emitGameMoveEvent } from "../ws/events/game/game.move.event.ws";

import {
  GameSnapshot,
  GameSummary,
  GameTermination,
  BW,
  Player,
  Movement,
} from "~/types/game.types";
import { UUID } from "~/types/common.types";
import { ChessClock } from "~/lib/game/GameClock";
import { GameMaster } from "~/lib/game/GameMaster";
import { emitGameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { getOrCreateGameSocketRoom } from "~/lib/ws/rooms/game.room.ws";
import { emitGameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";

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

/**
 * A player chess game
 */
export class GameInstance {
  private readonly _master: GameMaster = GameMaster.instance();

  public readonly id: UUID;
  public readonly players: BW<Player>;

  private readonly game: Chess = new Chess();
  private summary: GameSummary | null = null;
  private terminated: boolean = false;
  private time: {
    isTimed: boolean;
    start: number | null;
    clock: ChessClock;
  };

  private readonly events = {
    /**
     * Runs on game start
     */
    onStart: (() => {
      logDev({
        message: `started game '${this.id}' with player's '${this.players.w.pid}' & '${this.players.b.pid}'`,
        color: loggingColourCode.FgGreen,
        category: loggingCategories.game,
      });
      const socketRoom = getOrCreateGameSocketRoom({ id: this.id });
      socketRoom.join(this.players.w.pid, this.players.b.pid);
      emitGameJoinEvent({ room: socketRoom }, this.snapshot());
    }).bind(this),

    /**
     * Runs on movement
     */
    onMove: ((move: Movement) => {
      emitGameMoveEvent(
        { room: getOrCreateGameSocketRoom({ id: this.id }) },
        {
          move: move,
          time: {
            isTimed: this.time.isTimed,
            remaining: this.time.clock.getDurations(),
          },
        },
      );
    }).bind(this),

    onEnd: (() => {
      logDev({
        message: [`ending game '${this.id}'`, this.summary],
        color: loggingColourCode.FgGreen,
        category: loggingCategories.game,
      });

      const socketRoom = getOrCreateGameSocketRoom({ id: this.id });
      emitGameEndEvent({ room: socketRoom }, {});

      socketRoom.deregister();

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
    players: { p1: Player; p2: Player },
    times: BW<number> | null = null,
  ) {
    if (
      this._master.getByPlayer(players.p1.pid) ||
      this._master.getByPlayer(players.p2.pid)
    ) {
      // One or more players is already in a game.
      const inGame = [];
      if (this._master.getByPlayer(players.p1.pid)) inGame.push(players.p1.pid);
      if (this._master.getByPlayer(players.p2.pid)) inGame.push(players.p2.pid);

      throw new GameExistsError(
        `unable to create game. Player(s) '${inGame.join("' & '")}' is already in game.`,
      );
    }

    this.id = uuidv1();
    this.players = this._generateColorConfiguration(players.p1, players.p2);
    this.time = {
      clock: new ChessClock(times ?? { w: 1, b: 1 }, (timedOutPerspective) => {
        this.end("timeout", this.getOppositePerspective(timedOutPerspective));
      }),
      isTimed: times !== null,
      start: null,
    };

    this._master._events.onCreate(this);

    //TODO: only start clock after both player's first moves or ~10 seconds to prevent disadvantage for slow loading times

    if (this.time.isTimed) this.time.clock.start();
    this.events.onStart();
  }

  public snapshot(): GameSnapshot {
    return {
      id: this.id,
      FEN: this.game.fen(),
      players: this.players,
      captured: this.getCaptured(),
      time: {
        isTimed: this.time.isTimed,
        remaining: this.time.clock.getDurations(),
      },
    };
  }

  // ###GAME END

  private end(termination: GameTermination, victor: Color) {
    const now = Date.now();
    this.summary = {
      id: this.id,
      players: this.players,
      conclusion: {
        boardState: this.game.fen(),
        termination: termination,
        victor: victor,
      },
      moves: this.game.history() as string[],
      time: {
        start: this.time.start ?? 0,
        end: now,
        duration: now - (this.time.start ?? 0),
      },
    };
    this.time.clock.stop();
    this.terminated = true;
    this.events.onEnd();
  }

  private getNaturalTermination(): GameTermination {
    if (this.game.isCheckmate()) {
      return "checkmate";
    } else if (this.game.isStalemate()) {
      return "stalemate";
    } else if (this.game.isThreefoldRepetition()) {
      return "3-fold repition";
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

    this.events.onMove({
      source: sourceSquare,
      target: targetSquare,
      promotion: promotion,
    });

    if (this.game.isGameOver() || this.game.isDraw()) {
      this.end(
        this.getNaturalTermination(),
        this.getOppositePerspective(this.game.turn()),
      );
    }
    if (this.time.isTimed && !this.terminated) {
      this.time.clock.switch();
    }
    return true;
  }

  public getIsTimed() {
    return this.time.isTimed;
  }

  public getTimes() {
    return this.time.clock.getDurations();
  }

  public getFEN(): string {
    return this.game.fen();
  }

  public getTurn(): Color {
    return this.game.turn();
  }

  public isConcluded(): boolean {
    return this.summary !== null;
  }

  public getSummary(): GameSummary | null {
    return this.summary;
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

  private _generateColorConfiguration(p1: Player, p2: Player): BW<Player> {
    // if (p1.preference === null && p2.preference === null || p2.preference === p1.preference) {
    //generate random configuration
    return Math.random() < 0.5
      ? {
          b: { pid: p1.pid },
          w: { pid: p2.pid },
        }
      : {
          w: { pid: p1.pid },
          b: { pid: p2.pid },
        };

    // return { //configuration that honours preferences
    //   w: p1.preference === "w" ? { id: p1.id, displayName: p1.displayName } : p2.preference === null ? { id: p2.id, displayName: p2.displayName } : { id: p1.id, displayName: p1.displayName },
    //   b: p1.preference === "b" ? { id: p1.id, displayName: p1.displayName } : p2.preference === null ? { id: p2.id, displayName: p2.displayName } : { id: p1.id, displayName: p1.displayName }
    // }
  }

  private getOppositePerspective(p: Color): Color {
    return p === "w" ? "b" : "w";
  }
}
