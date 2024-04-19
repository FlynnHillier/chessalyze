import { UUID } from "~/types/common.types";
import {
  Square as chessJSSquare,
  Color as chessJSColor,
  PieceSymbol,
} from "chess.js";
import { z } from "zod";
import { zodGameTimePreset } from "~/server/api/routers/lobby/zod/lobby.isTimingTemplate";
import {
  CAPTURABLEPIECE,
  PROMOTIONPIECE,
  TERMINATIONS,
  TILEIDS,
} from "~/constants/game";

export type FEN = string;

export type GameTermination = (typeof TERMINATIONS)[number];

export type PromotionSymbol = (typeof PROMOTIONPIECE)[number];

export type CapturableSymbol = (typeof CAPTURABLEPIECE)[number];

export type GameTimePreset = z.infer<typeof zodGameTimePreset>;

export type Square = (typeof TILEIDS)[number];

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
  fen: FEN;
  time: {
    sinceStart: number;
    timestamp: number;
    remaining?: BW<number>;
    moveDuration: number;
  };
  initiator: {
    player?: Player;
    color: Color;
  };
};

/**
 * refers to a user while handling game management
 */
export type Player = {
  pid: UUID;
  username: string;
  image?: string;
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
  players: Partial<BW<Player>>;
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
