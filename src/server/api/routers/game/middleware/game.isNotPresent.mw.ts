import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "~/server/api/trpc";
import { GameMaster } from "~/lib/game/GameMaster";

/**
 * Ensures player is not in game.
 *
 * Should only be called within protected procedure.
 */
export const trpcGameIsNotPresentMiddleware = createTRPCMiddleware(
  ({ ctx, next }) => {
    const existingGame = GameMaster.instance().getByPlayer(ctx.user!.id);

    if (existingGame !== null) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "User is in game",
      });
    }

    return next();
  },
);
