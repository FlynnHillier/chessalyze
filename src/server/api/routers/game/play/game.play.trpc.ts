import { createTRPCRouter } from "~/server/api/trpc";

import { trpcGameMoveProcedure } from "~/server/api/routers/game/play/procedures/game.move.proc";
import { trpcGameResignProcedure } from "~/server/api/routers/game/play/procedures/game.resign.proc";

export const trpcGamePlayRouter = createTRPCRouter({
  move: trpcGameMoveProcedure,
  resign: trpcGameResignProcedure,
});
