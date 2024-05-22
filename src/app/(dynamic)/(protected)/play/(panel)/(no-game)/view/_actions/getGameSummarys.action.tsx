"use server";

import {
  getGameSummary,
  getRecentGameSummarys,
} from "~/lib/drizzle/transactions/game.drizzle";

export async function getRecentGameSummarysAction(count?: number | true) {
  return await getRecentGameSummarys({ count });
}
