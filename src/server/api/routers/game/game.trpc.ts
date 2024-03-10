import { createTRPCRouter } from "~/server/api/trpc"

import { trpcGameStatusProcedure } from "~/server/api/routers/game/procedures/game.status.proc"
import { trpcGameMoveProcedure } from "~/server/api/routers/game/procedures/game.move.proc"
import { trpcGameOnEndProcedure } from "~/server/api/routers/game/procedures/game.onEnd.proc"
import { trpcGameOnJoinProcedure } from "~/server/api/routers/game/procedures/game.onJoin.proc"
import { trpcGameOnMoveProcedure } from "~/server/api/routers/game/procedures/game.onMove.proc"

export const trpcGameRouter = createTRPCRouter({
    status: trpcGameStatusProcedure,
    move: trpcGameMoveProcedure,
    onMove: trpcGameOnMoveProcedure,
    onEnd: trpcGameOnEndProcedure,
    onJoin: trpcGameOnJoinProcedure,
})