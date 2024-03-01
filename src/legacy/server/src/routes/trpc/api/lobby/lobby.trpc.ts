import { t } from "../../init.trpc"
import { trpcLobbyCreateProcedure } from "./procedures/lobby.create.proc"
import { trpcLobbyJoinProcedure } from "./procedures/lobby.join.proc"
import { trpcLobbyLeaveProcedure } from "./procedures/lobby.leave.proc"
import { trpcLobbyStatusProcedure } from "./procedures/lobby.status.proc"

export const trpcLobbyRouter = t.router({
    create:trpcLobbyCreateProcedure,
    join:trpcLobbyJoinProcedure,
    leave:trpcLobbyLeaveProcedure,
    status:trpcLobbyStatusProcedure,
})