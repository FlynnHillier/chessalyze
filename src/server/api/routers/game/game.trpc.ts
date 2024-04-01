import { createTRPCRouter } from "~/server/api/trpc";

import { trpcGameStatusProcedure } from "~/server/api/routers/game/procedures/game.status.proc";
import { trpcGameMoveProcedure } from "~/server/api/routers/game/procedures/game.move.proc";

export const trpcGameRouter = createTRPCRouter({
  status: trpcGameStatusProcedure,
  move: trpcGameMoveProcedure,
});
