import { z, ZodType } from "zod";
import { BW } from "~/types/game.types";
import {
  CAPTURABLEPIECE,
  DECISIVE_TERMINATIONS,
  DRAW_TERMINATIONS,
  PIECE,
  PROMOTIONPIECE,
  TILEIDS,
  TIME_PRESET,
} from "~/constants/game";
import {
  zRecord,
  zStringLiteralUnionFromArray,
} from "~/lib/zod/util.validators";

export const zUUID = z.string();

export const zFEN = z.string();

export const zDecisiveGameTermination = z.union([
  z.literal("checkmate"),
  z.literal("timeout"),
  z.literal("resignation"),
]);

export const zIndecisiveGameTermination = z.union([
  z.literal("3-fold repitition"),
  z.literal("50 move rule"),
  z.literal("insufficient material"),
  z.literal("stalemate"),
  z.literal("timeout vs insufficient material"),
]);

export const zGenericGameTermination = z.union([
  z.literal("checkmate"),
  z.literal("timeout"),
  z.literal("resignation"),
  z.literal("3-fold repitition"),
  z.literal("50 move rule"),
  z.literal("insufficient material"),
  z.literal("stalemate"),
  z.literal("timeout vs insufficient material"),
]);

export const zPromotablePieceSymbol = z.union([
  z.literal("r"),
  z.literal("n"),
  z.literal("b"),
  z.literal("q"),
]);

export const zCapturablePieceSymbol = z.union([
  z.literal("p"),
  z.literal("r"),
  z.literal("n"),
  z.literal("b"),
  z.literal("q"),
]);

export const zGenericPieceSymbol = z.union([
  z.literal("p"),
  z.literal("r"),
  z.literal("n"),
  z.literal("b"),
  z.literal("q"),
  z.literal("k"),
]);

export const zGameTimePreset = z.union([
  z.literal("30s"),
  z.literal("1m"),
  z.literal("5m"),
  z.literal("10m"),
  z.literal("15m"),
  z.literal("30m"),
  z.literal("1h"),
]);

export const zSquare = z.union([
  z.literal("a1"),
  z.literal("a2"),
  z.literal("a3"),
  z.literal("a4"),
  z.literal("a5"),
  z.literal("a6"),
  z.literal("a7"),
  z.literal("a8"),
  z.literal("b1"),
  z.literal("b2"),
  z.literal("b3"),
  z.literal("b4"),
  z.literal("b5"),
  z.literal("b6"),
  z.literal("b7"),
  z.literal("b8"),
  z.literal("c1"),
  z.literal("c2"),
  z.literal("c3"),
  z.literal("c4"),
  z.literal("c5"),
  z.literal("c6"),
  z.literal("c7"),
  z.literal("c8"),
  z.literal("d1"),
  z.literal("d2"),
  z.literal("d3"),
  z.literal("d4"),
  z.literal("d5"),
  z.literal("d6"),
  z.literal("d7"),
  z.literal("d8"),
  z.literal("e1"),
  z.literal("e2"),
  z.literal("e3"),
  z.literal("e4"),
  z.literal("e5"),
  z.literal("e6"),
  z.literal("e7"),
  z.literal("e8"),
  z.literal("f1"),
  z.literal("f2"),
  z.literal("f3"),
  z.literal("f4"),
  z.literal("f5"),
  z.literal("f6"),
  z.literal("f7"),
  z.literal("f8"),
  z.literal("g1"),
  z.literal("g2"),
  z.literal("g3"),
  z.literal("g4"),
  z.literal("g5"),
  z.literal("g6"),
  z.literal("g7"),
  z.literal("g8"),
  z.literal("h1"),
  z.literal("h2"),
  z.literal("h3"),
  z.literal("h4"),
  z.literal("h5"),
  z.literal("h6"),
  z.literal("h7"),
  z.literal("h8"),
]);

export const zColor = z.union([z.literal("w"), z.literal("b")]);

export function zBW<Z extends ZodType>(type: Z) {
  return z.object({
    w: type,
    b: type,
  });
}
export const zCapturedPiecesMapping = zBW(
  z.object({
    p: z.number(),
    r: z.number(),
    q: z.number(),
    n: z.number(),
    b: z.number(),
  }),
);

export const zPlayer = z.object({
  pid: z.string(),
  username: z.string(),
  image: z.string().optional(),
});

export const zMovement = z.object({
  piece: zGenericPieceSymbol,
  source: zSquare,
  target: zSquare,
  promotion: zPromotablePieceSymbol.optional(),
});

export const zVerboseMovement = z.object({
  move: zMovement,
  fen: zFEN,
  time: z.object({
    sinceStart: z.number(),
    timestamp: z.number(),
    remaining: zBW(z.number()).optional(), //z.object({ w: z.number(), b: z.number() }).optional(),
    moveDuration: z.number(),
  }),
  initiator: z.object({
    player: zPlayer.optional(),
    color: zColor,
  }),
  captured: zCapturedPiecesMapping,
});

export const zGameSnapshot = z.object({
  id: zUUID,
  players: zBW(zPlayer),
  FEN: zFEN,
  captured: zCapturedPiecesMapping,
  time: z.object({
    start: z.number(),
    now: z.number(),
    remaining: z
      .object({
        w: z.number(),
        b: z.number(),
      })
      .optional(),
    initial: z.object({
      remaining: z
        .object({
          w: z.number(),
          b: z.number(),
        })
        .optional(),
    }),
  }),
  moves: z.array(zVerboseMovement),
});

export const zGameConclusion = z.object({
  termination: zGenericGameTermination,
  victor: zColor.or(z.null()),
  boardState: zFEN,
});

export const zGameSummary = z.object({
  id: zUUID,
  players: zBW(zPlayer).partial(),
  conclusion: zGameConclusion,
  moves: z.array(zVerboseMovement),
  time: z.object({
    clock: z
      .object({
        initial: z.object({
          template: zGameTimePreset.optional(),
          absolute: zBW(z.number()),
        }),
        end: z.object({
          absolute: zBW(z.number()),
        }),
      })
      .optional(),
    start: z.number(),
    end: z.number(),
    duration: z.number(),
  }),
});

export default {
  zUUID,
  zFEN,
  zDecisiveGameTermination,
  zIndecisiveGameTermination,
  zGenericGameTermination,
  zPromotablePieceSymbol,
  zCapturablePieceSymbol,
  zGenericPieceSymbol,
  zGameTimePreset,
  zSquare,
  zColor,
  zBW,
  zCapturedPiecesMapping,
  zPlayer,
  zMovement,
  zVerboseMovement,
  zGameSnapshot,
  zGameConclusion,
  zGameSummary,
} as const satisfies Record<string, ZodType | ((...args: any[]) => ZodType)>;
