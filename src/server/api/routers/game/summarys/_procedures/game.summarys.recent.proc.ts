import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { getRecentGameSummarys } from "~/lib/drizzle/transactions/game.drizzle";

export const trpcGameSummarysRecentProcedure = publicProcedure
  .input(
    z
      .object({
        count: z.number().min(0).max(50).default(20),
      })
      .default({}),
  )
  .query(async ({ input }) => {
    return await getRecentGameSummarys({ count: input.count });
  });
