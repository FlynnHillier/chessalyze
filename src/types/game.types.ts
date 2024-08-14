import { UUID } from "~/types/common.types";
import {
  Square as chessJSSquare,
  Color as chessJSColor,
  PieceSymbol,
} from "chess.js";
import {
  CAPTURABLEPIECE,
  DECISIVE_TERMINATIONS,
  DRAW_TERMINATIONS,
  PROMOTIONPIECE,
  TILEIDS,
  TIME_PRESET,
} from "~/constants/game";

export type FEN = string;

export type DecisiveGameTermination = (typeof DECISIVE_TERMINATIONS)[number];

export type DrawGameTermination = (typeof DRAW_TERMINATIONS)[number];

export type GameTermination = DecisiveGameTermination | DrawGameTermination;

export type PromotionSymbol = (typeof PROMOTIONPIECE)[number];

export type CapturableSymbol = (typeof CAPTURABLEPIECE)[number];

export type GameTimePreset = (typeof TIME_PRESET)[number];

export type Square = (typeof TILEIDS)[number];

export type BW<T> = {
  w: T;
  b: T;
};

export type CapturedMapping = BW<{ [key in CapturableSymbol]: number }>;

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
  captured: CapturedMapping;
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
  captured: CapturedMapping;
  time: {
    start: number;
    now: number;
    remaining?: BW<number>;
    initial: {
      remaining?: BW<number>;
    };
  };
  moves: VerboseMovement[];
}

export type GameSummary = {
  id: UUID;
  players: Partial<BW<Player>>;
  conclusion: GameConclusion;
  moves: VerboseMovement[];
  time: {
    clock?: {
      initial: {
        template?: GameTimePreset;
        absolute: BW<number>;
      };
      end: {
        absolute: BW<number>;
      };
    };
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
