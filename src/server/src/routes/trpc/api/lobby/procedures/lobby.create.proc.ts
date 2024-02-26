import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { trpcGameIsNotPresentMiddleware } from "../../game/middleware/game.isNotPresent.mw";
import { LOBBYPROCEDURE } from "../lobby.proc";
import { trpcLobbyIsNotPresentMiddleware } from "../middleware/lobby.isNotPresent.mw";

export const trpcLobbyCreateProcedure = LOBBYPROCEDURE
    .use(trpcLobbyIsNotPresentMiddleware)
    .use(trpcGameIsNotPresentMiddleware)
    .mutation(({ctx}) => {
        const lobby = GameInstanceManager.createLobby({
            id:ctx.user!.uuid,
            displayName:ctx.user!.name
        })

        return {
            lobby:{
                id:lobby.id
            }
        }
    })