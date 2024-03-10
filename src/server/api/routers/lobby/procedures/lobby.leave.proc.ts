import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc"
import { GameInstanceManager } from "~/lib/game/GameInstanceManager"

export const trpcLobbyLeaveProcedure = LOBBYPROCEDURE
    .mutation(({ ctx }) => {
        const { id: pid } = ctx.session.user

        const existingUserLobby = GameInstanceManager.getPlayerLobby(pid)

        if (existingUserLobby === null) {
            return
        }

        GameInstanceManager.endLobby(existingUserLobby.id)

        return
    })