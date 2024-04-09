import { UUID } from "~/types/common.types";
import {
  Square as chessJSSquare,
  Color as chessJSColor,
  PieceSymbol,
} from "chess.js";
import { z } from "zod";
import { zodGameTimePreset } from "~/server/api/routers/lobby/zod/lobby.isTimingTemplate";

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

export type GameTimePreset = z.infer<typeof zodGameTimePreset>;

export type Square = chessJSSquare;

export type BW<T> = {
  w: T;
  b: T;
};

export type Color = chessJSColor;

export type Movement = {
  piece: PieceSymbol; //TODO add this
  source: Square;
  target: Square;
  promotion?: PromotionSymbol;
};

export type VerboseMovement = {
  move: Movement;
  time: {
    isTimed: boolean;
    sinceStart: number;
    timestamp: number;
    remaining?: BW<number>;
    moveDuration: number;
  };
  initiator: Player & { color: Color };
};

/**
 * refers to a user while handling game management
 */
export type Player = {
  pid: UUID;
  username: string;
  image: string;
};

export interface GameSnapshot {
  id: UUID;
  players: BW<Player>;
  FEN: FEN;
  captured: BW<{ [key in CapturableSymbol]: number }>;
  time: {
    start: number;
    now: number;
    remaining?: BW<number>;
  };
  moves: VerboseMovement[];
}

export type GameSummary = {
  id: UUID;
  players: {
    w: Player;
    b: Player;
  };
  conclusion: GameConclusion;
  moves: VerboseMovement[];
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
