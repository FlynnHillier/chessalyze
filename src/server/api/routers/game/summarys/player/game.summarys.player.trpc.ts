import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import z from "zod";
import { zLimitedGameSummaryCount } from "~/server/api/routers/game/summarys/game.summary.limits";
import { getPlayerGameSummarys } from "~/lib/drizzle/transactions/game.drizzle";

export const trpcGameSummarysPlayerRouter = createTRPCRouter({
  recent: protectedProcedure
    .input(
      z.object({
        playerID: z.string(),
        count: zLimitedGameSummaryCount,
      }),
    )
    .query(async ({ input }) => {
      return await getPlayerGameSummarys(input.playerID);
    }),
});
