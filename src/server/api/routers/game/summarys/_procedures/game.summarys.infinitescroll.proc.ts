import { publicProcedure } from "~/server/api/trpc";
import z from "zod";
import {
  drizzleGameSummaryWithQuery,
  pgGameSummaryQueryResultToGameSummary,
} from "~/lib/drizzle/transactions/game.drizzle";
import { games } from "~/lib/drizzle/games.schema";
import { count } from "drizzle-orm";

export const trpcGameSummarysInfiniteScrollProcedure = publicProcedure
  .input(
    z.object({
      start: z.number().min(0),
      count: z.number().min(0).max(10).default(5),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { db } = ctx;

    const pgResult = await db.query.games.findMany({
      with: drizzleGameSummaryWithQuery,
      limit: input.count,
      orderBy: (games, { desc }) => [desc(games.serial)],
      offset: input.start,
    });

    const summarys = pgResult.map(pgGameSummaryQueryResultToGameSummary);

    const summaryCountRes = await db
      .select({ count: count(games.id) })
      .from(games);

    const summaryCount = summaryCountRes[0].count;

    const isMore = input.start + input.count < summaryCount;

    return {
      isMore: isMore,
      tail: isMore ? input.start + input.count : summaryCount,
      data: summarys,
    };
  });
