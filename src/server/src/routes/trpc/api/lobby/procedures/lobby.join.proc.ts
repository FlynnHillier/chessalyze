import { TRPCError } from "@trpc/server";
import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { LOBBYPROCEDURE } from "../lobby.proc";
import { z } from "zod"
import { trpcGameIsNotPresentMiddleware } from "../../game/middleware/game.isNotPresent.mw";


export const trpcLobbyJoinProcedure =  LOBBYPROCEDURE
    .use(trpcGameIsNotPresentMiddleware)
    .input(z.object({
        lobby:z.object({
            id:z.string(),
        })
    }))
    .mutation(({ctx,input}) => {
        const existingUserLobby = GameInstanceManager.getPlayerLobby(ctx.user!.uuid)
        
        const joinedGame = GameInstanceManager.joinLobby({
            targetLobbyID:input.lobby.id,
            player:{
                id:ctx.user!.uuid,
                displayName:ctx.user!.name,
            }
        })

        if (joinedGame === null)
        {
            //Game join was unsuccessful
            throw new TRPCError({
                code:"NOT_FOUND",
                message:"Target lobby was not found or is no longer available."
            })
        }

        if (existingUserLobby && joinedGame !== null)
        { 
            //if player was already in a lobby, and game join was successful - end previous lobby.
            GameInstanceManager.endLobby(existingUserLobby!.id)
        }

        return {
            game:joinedGame.snapshot()
        }
    })