import { t } from "../../init.trpc"
import { trpcCreateLobbyProcedure } from "./procedures/lobby.create.proc"
import { trpcJoinLobbyProcedure } from "./procedures/lobby.join.proc"

export const trpcLobbyRouter = t.router({
    create:trpcCreateLobbyProcedure,
    join:trpcJoinLobbyProcedure,
})