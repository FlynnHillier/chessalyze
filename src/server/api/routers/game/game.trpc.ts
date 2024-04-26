import { createTRPCRouter } from "~/server/api/trpc";

import { trpcGamePlayRouter } from "~/server/api/routers/game/play/game.play.trpc";
import { trpcGameStatusProcedure } from "~/server/api/routers/game/_procedures/game.status.proc";
import { trpcGameSummarysRouter } from "~/server/api/routers/game/summarys/game.summarys.trpc";

export const trpcGameRouter = createTRPCRouter({
  play: trpcGamePlayRouter,
  status: trpcGameStatusProcedure,
  summary: trpcGameSummarysRouter,
});
