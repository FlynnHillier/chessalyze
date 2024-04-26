import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { trpcGameIsPresentMiddleware } from "~/server/api/routers/game/play/middleware/game.isPresent.mw";
import { zodIsTileValidator } from "~/server/api/routers/game/play/zod/game.isTile.zod";
import { zodIsPromotionPieceValidator } from "~/server/api/routers/game/play/zod/game.isPromotionPiece.zod";

export const trpcGameMoveProcedure = GAMEPROCEDURE.use(
  trpcGameIsPresentMiddleware,
)
  .input(
    z.object({
      move: z.object({
        source: zodIsTileValidator,
        target: zodIsTileValidator,
        promotion: z.optional(zodIsPromotionPieceValidator),
      }),
    }),
  )
  .mutation(({ ctx, input }) => {
    const { move } = input;
    const { game, user } = ctx;

    if (!game.isPlayerTurn(user!.id)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "incorrect turn",
      });
    }

    if (!game.isValidMove(move.source, move.target, move.promotion)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "invalid move",
      });
    }

    game.move(move.source, move.target, move.promotion);

    return {
      success: true,
    };
  });
