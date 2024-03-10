import { Chess, Square, Move, Color, PieceSymbol } from "chess.js"
import { v1 as uuidv1 } from "uuid"
import { emitGameMoveEvent } from "../ws/events/game/game.move.event.ws"

import { GameSnapshot, GameSummary, GameTermination, BW, Player } from "~/types/game.types"
import { UUID } from "~/types/common.types"
import { ChessClock } from "~/lib/game/GameClock"

interface EventCallBacks {
  conclusion: (...args: any[]) => void
}

export class GameInstance {
  public players: {
    w: Player,
    b: Player
  }
  public id: UUID
  private summary: GameSummary | null = null
  private game: Chess = new Chess()
  private events: EventCallBacks = { conclusion: () => { } }
  private terminated: boolean = false
  private time: {
    isTimed: boolean
    start: number
    clock: ChessClock
  }

  constructor(p1: Player, p2: Player, times: null | BW<number>) {
    this.players = this._generateColorConfiguration(p1, p2)
    this.id = uuidv1()


    const clock = new ChessClock(
      times ?? { w: 1, b: 1 },
      (timedOutPerspective) => {
        this.end("timeout", this.getOppositePerspective(timedOutPerspective))
      }
    )


    this.time = {
      clock: clock,
      isTimed: times != null,
      start: Date.now(),
    }

    if (this.time.isTimed) {
      //TODO: change this so that clock only starts after player has moved or ~10 seconds has elapsed without a move
      this.time.clock.start()
    }
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
      }
    }
  }


  // ###GAME END

  private end(termination: GameTermination, victor: Color) {
    const now = Date.now()
    this.summary = {
      id: this.id,
      players: this.players,
      conclusion: {
        boardState: this.game.fen(),
        termination: termination,
        victor: victor
      },
      moves: this.game.history() as string[],
      time: {
        start: this.time.start,
        end: now,
        duration: now - this.time.start,
      }
    }
    this.time.clock.stop()
    this.events.conclusion()
    this.terminated = true
  }

  private getNaturalTermination(): GameTermination {
    if (this.game.isCheckmate()) {
      return "checkmate"
    } else if (this.game.isStalemate()) {
      return "stalemate"
    } else if (this.game.isThreefoldRepetition()) {
      return "3-fold repition"
    } else if (this.game.isInsufficientMaterial()) {
      return "insufficient material"
    } else {
      return "50 move rule"
    }
  }

  public move(sourceSquare: Square, targetSquare: Square, promotion?: "n" | "b" | "r" | "q"): boolean {
    const moveResult = this.game.move({ from: sourceSquare, to: targetSquare, promotion: promotion }) === null ? false : true
    if (moveResult === false) {
      return false
    }

    emitGameMoveEvent(this.id, {
      move: {
        source: sourceSquare,
        target: targetSquare,
        promotion: promotion,
      },
      time: {
        isTimed: this.time.isTimed,
        remaining: this.time.clock.getDurations()
      }
    })

    if (this.game.isGameOver() || this.game.isDraw()) {
      this.end(
        this.getNaturalTermination(),
        this.getOppositePerspective(this.game.turn())
      )
    }
    if (this.time.isTimed && !this.terminated) {
      this.time.clock.switch()
    }
    return true
  }

  public getIsTimed() {
    return this.time.isTimed
  }

  public getTimes() {
    return this.time.clock.getDurations()
  }

  public getFEN(): string {
    return this.game.fen()
  }

  public getTurn(): Color {
    return this.game.turn()
  }

  public isConcluded(): boolean {
    return this.summary !== null
  }

  public getSummary(): GameSummary | null {
    return this.summary
  }

  public getCaptured(): BW<{ [key in PieceSymbol]: number }> {
    const captures: BW<{ [key in PieceSymbol]: number }> = {
      w: {
        "n": 0,
        "b": 0,
        "q": 0,
        "r": 0,
        "p": 0,
        "k": 0,
      },
      b: {
        "n": 0,
        "b": 0,
        "q": 0,
        "r": 0,
        "p": 0,
        "k": 0,
      }
    }

    for (let move of this.game.history({ verbose: true }) as Move[]) {
      if (move.captured) {
        captures[move.color][move.captured]++
      }
    }

    return captures
  }

  public setEventCallback(event: keyof EventCallBacks, cb: (...args: any[]) => void) {
    this.events[event] = cb
  }

  public getPlayerColor(playerUUID: UUID): Color { //unsafe, change in future.
    if (this.players.w.pid === playerUUID) {
      return "w"
    } else {
      return "b"
    }
  }


  public isPlayerTurn(playerUUID: UUID): boolean {
    return this.game.turn() === this.getPlayerColor(playerUUID)
  }

  public isValidMove(sourceSquare: Square, targetSquare: Square, promotion?: "n" | "b" | "r" | "q") {
    const verboseMoves: Move[] = this.game.moves({ verbose: true }) as Move[]
    return verboseMoves.some((move) => { return move.from === sourceSquare && move.to === targetSquare && move.promotion === promotion })
  }

  private _generateColorConfiguration(p1: Player, p2: Player): BW<Player> {
    // if (p1.preference === null && p2.preference === null || p2.preference === p1.preference) {
    //generate random configuration
    return Math.random() < 0.5 ?
      {
        b: { pid: p1.pid },
        w: { pid: p2.pid }
      }
      :
      {
        w: { pid: p1.pid },
        b: { pid: p2.pid }
      }

    // return { //configuration that honours preferences
    //   w: p1.preference === "w" ? { id: p1.id, displayName: p1.displayName } : p2.preference === null ? { id: p2.id, displayName: p2.displayName } : { id: p1.id, displayName: p1.displayName },
    //   b: p1.preference === "b" ? { id: p1.id, displayName: p1.displayName } : p2.preference === null ? { id: p2.id, displayName: p2.displayName } : { id: p1.id, displayName: p1.displayName }
    // }
  }


  private getOppositePerspective(p: Color): Color {
    return p === "w" ? "b" : "w"
  }
}