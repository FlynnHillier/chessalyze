import { createTRPCRouter } from "~/server/api/trpc";
import { trpcGameSummarysPlayerRouter } from "~/server/api/routers/game/summarys/player/game.summarys.player.trpc";
import { trpcGameSummarysSelfRouter } from "~/server/api/routers/game/summarys/self/game.summarys.self.trpc";
import { trpcGameSummarysTargetProcedure } from "~/server/api/routers/game/summarys/_procedures/game.summarys.target.proc";
import { trpcGameSummarysRecentProcedure } from "~/server/api/routers/game/summarys/_procedures/game.summarys.recent.proc";
import { trpcGameSummarysInfiniteScrollProcedure } from "~/server/api/routers/game/summarys/_procedures/game.summarys.infinitescroll.proc";

export const trpcGameSummarysRouter = createTRPCRouter({
  player: trpcGameSummarysPlayerRouter,
  self: trpcGameSummarysSelfRouter,
  target: trpcGameSummarysTargetProcedure,
  recent: trpcGameSummarysRecentProcedure,
  infiniteScroll: trpcGameSummarysInfiniteScrollProcedure,
});
