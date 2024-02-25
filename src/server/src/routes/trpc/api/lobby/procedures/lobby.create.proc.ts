import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { lobbyProcedure } from "../lobby.proc";
import { trpcLobbyIsNotPresentMiddleware } from "../middleware/lobby.isNotPresent.mw";

//add middleware which checks for empty game and empty lobby
export const trpcCreateLobbyProcedure = lobbyProcedure
    .use(trpcLobbyIsNotPresentMiddleware)
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