import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { LOBBYPROCEDURE } from "../lobby.proc";


export const trpcLobbyLeaveProcedure =  LOBBYPROCEDURE
    .query(({ctx}) => {
        const existingUserLobby = GameInstanceManager.getPlayerLobby(ctx.user!.uuid)

        if (existingUserLobby === null)
        {
            return
        }

        GameInstanceManager.endLobby(existingUserLobby.id)

        return
    })