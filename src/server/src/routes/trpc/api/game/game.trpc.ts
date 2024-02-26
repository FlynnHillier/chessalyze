import { t } from "../../init.trpc"
import { trpcGameStatusProcedure } from "./procedures/game.state.proc"
import { trpcGameMoveProcedure } from "./procedures/game.move.proc"

export const trpcGameRouter = t.router({
    status:trpcGameStatusProcedure,
    move:trpcGameMoveProcedure,
})