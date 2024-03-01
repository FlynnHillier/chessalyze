import { t } from "../init.trpc"
import { trpcGameRouter } from "./game/game.trpc"
import { trpcLobbyRouter } from "./lobby/lobby.trpc"

export const trpcApiRouter = t.router({
    lobby:trpcLobbyRouter,
    game:trpcGameRouter
})