import { z, ZodType } from "zod";
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

export const zDecisiveGameTermination = zStringLiteralUnionFromArray(
  DECISIVE_TERMINATIONS,
);

export const zIndecisiveGameTermination =
  zStringLiteralUnionFromArray(DRAW_TERMINATIONS);

export const zGenericGameTermination = zStringLiteralUnionFromArray([
  ...DECISIVE_TERMINATIONS,
  ...DRAW_TERMINATIONS,
]);

export const zPromotablePieceSymbol =
  zStringLiteralUnionFromArray(PROMOTIONPIECE);

export const zCapturablePieceSymbol =
  zStringLiteralUnionFromArray(CAPTURABLEPIECE);

export const zGenericPieceSymbol = zStringLiteralUnionFromArray(PIECE);

export const zGameTimePreset = zStringLiteralUnionFromArray(TIME_PRESET);

export const zSquare = zStringLiteralUnionFromArray(TILEIDS);

export const zColor = z.union([z.literal("w"), z.literal("b")]);

export const zBW = (type: ZodType) =>
  z.object({
    w: type,
    b: type,
  });

export const zCapturedPiecesMapping = zBW(zRecord(CAPTURABLEPIECE, z.number()));

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
    remaining: zBW(z.number()).optional(),
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
    remaining: zBW(z.number()).optional(),
    initial: z.object({
      remaining: zBW(z.number()).optional(),
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
