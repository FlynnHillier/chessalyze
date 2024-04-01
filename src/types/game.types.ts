import { UUID } from "~/types/common.types";
import { Square as chessJSSquare, Color as chessJSColor } from "chess.js";

export type FEN = string;

export type GameTermination =
  | "checkmate"
  | "3-fold repition"
  | "50 move rule"
  | "insufficient material"
  | "stalemate"
  | "resignation"
  | "timeout"
  | "timeout vs insufficient material";

export type PromotionSymbol = "r" | "b" | "n" | "q";

export type CapturableSymbol = "r" | "b" | "n" | "q" | "p";

export type Square = chessJSSquare;

export type BW<T> = {
  w: T;
  b: T;
};

export type Color = chessJSColor;

export type Movement = {
  source: Square;
  target: Square;
  promotion?: PromotionSymbol;
};

export type RetrospectiveMovement = {
  move: Movement;
  time: {
    sinceStart: number;
    timestamp: number;
    clocks?: BW<number>;
  };
  initiator: Player & { color: Color };
};

/**
 * refers to a user while handling game management
 */
export type Player = {
  pid: UUID;
};

export interface GameSnapshot {
  id: UUID;
  players: BW<Player>;
  FEN: FEN;
  captured: BW<{ [key in CapturableSymbol]: number }>;
  time: {
    isTimed: boolean;
    remaining: BW<number>;
  };
}

export type GameSummary = {
  id: UUID;
  players: {
    w: Player;
    b: Player;
  };
  conclusion: GameConclusion;
  moves: RetrospectiveMovement[];
  time: {
    start: number;
    end: number;
    duration: number;
  };
};

export type GameConclusion = {
  termination: GameTermination;
  victor: null | "w" | "b";
  boardState: FEN;
};
