import { createTRPCRouter } from "~/server/api/trpc"

import { trpcLobbyCreateProcedure } from "~/server/api/routers/lobby/procedures/lobby.create.proc"
import { trpcLobbyJoinProcedure } from "~/server/api/routers/lobby/procedures/lobby.join.proc"
import { trpcLobbyLeaveProcedure } from "~/server/api/routers/lobby/procedures/lobby.leave.proc"
import { trpcLobbyStatusProcedure } from "~/server/api/routers/lobby/procedures/lobby.status.proc"

export const trpcLobbyRouter = createTRPCRouter({
    create: trpcLobbyCreateProcedure,
    join: trpcLobbyJoinProcedure,
    leave: trpcLobbyLeaveProcedure,
    status: trpcLobbyStatusProcedure,
})