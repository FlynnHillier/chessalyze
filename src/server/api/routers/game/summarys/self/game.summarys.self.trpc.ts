import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import z from "zod";
import { zLimitedGameSummaryCount } from "~/server/api/routers/game/summarys/game.summary.limits";
import { getPlayerGameSummarys } from "~/lib/drizzle/transactions/game.drizzle";

export const trpcGameSummarysSelfRouter = createTRPCRouter({
  recent: protectedProcedure
    .input(
      z
        .object({
          count: zLimitedGameSummaryCount,
        })
        .default({}),
    )
    .query(async ({ input, ctx }) => {
      return await getPlayerGameSummarys(ctx.user.id, { count: input.count });
    }),
});
