import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { GameSummary } from "~/types/game.types";
import { trpcGameIsPresentMiddleware } from "~/server/api/routers/game/middleware/game.isPresent.mw";

/**
 * Allow user to resign from their game.
 */
export const trpcGameResignProcedure = GAMEPROCEDURE.use(
  trpcGameIsPresentMiddleware,
).mutation(({ ctx }) => {
  const { game } = ctx;

  game.resign({ playerID: ctx.user!.id });

  return {
    summary: game.getSummary() as GameSummary,
  };
});
