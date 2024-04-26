import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "~/server/api/trpc";
import { GameMaster } from "~/lib/game/GameMaster";

/**
 * Ensure user is in game.
 *
 * Should only be called within protected procedure.
 */
export const trpcGameIsPresentMiddleware = createTRPCMiddleware(
  ({ ctx, next }) => {
    const { id } = ctx.user!;

    const existingGame = GameMaster.instance().getByPlayer(id);

    if (existingGame === null) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "User is not in game",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        game: existingGame,
      },
    });
  },
);
