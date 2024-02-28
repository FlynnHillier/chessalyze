import { t } from "../../init.trpc"
import { trpcGameStatusProcedure } from "./procedures/game.status.proc"
import { trpcGameMoveProcedure } from "./procedures/game.move.proc"
import { trpcGameOnMoveProcedure } from "./procedures/game.onMove.proc"
import { trpcGameOnEndProcedure } from "./procedures/game.onEnd.proc"
import { trpcGameOnJoinProcedure } from "./procedures/game.onJoin.proc"

export const trpcGameRouter = t.router({
    status:trpcGameStatusProcedure,
    move:trpcGameMoveProcedure,
    onMove:trpcGameOnMoveProcedure,
    onEnd:trpcGameOnEndProcedure,
    onJoin:trpcGameOnJoinProcedure,
})