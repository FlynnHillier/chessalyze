import { t } from "../init.trpc"
import { trpcLobbyRouter } from "./lobby/lobby.trpc"

export const trpcApiRouter = t.router({
    lobby:trpcLobbyRouter,
})