import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { LOBBYPROCEDURE } from "../lobby.proc";


export const trpcLobbyStatusProcedure =  LOBBYPROCEDURE
    .query(({ctx}) => {
        const existingUserLobby = GameInstanceManager.getPlayerLobby(ctx.user!.uuid)

        if (existingUserLobby === null)
        {
            return {
                present:false,
            }
        }

        return {
            present:true,
            lobby:{
                id:existingUserLobby.id
            }
        }
    })