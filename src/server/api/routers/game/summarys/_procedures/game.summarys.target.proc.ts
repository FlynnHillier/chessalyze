import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { getGameSummary } from "~/lib/drizzle/transactions/game.drizzle";

export const trpcGameSummarysTargetProcedure = publicProcedure
  .input(
    z.object({
      gameID: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    return await getGameSummary(input.gameID);
  });
