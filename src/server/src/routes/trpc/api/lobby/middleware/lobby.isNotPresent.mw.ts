import { t } from "../../../init.trpc"
import { TRPCError } from "@trpc/server";
import { GameInstanceManager } from "../../../../../game/GameInstanceManager";

export const trpcLobbyIsNotPresentMiddleware = t.middleware(({ctx, next}) => {
    const existingUserLobby = GameInstanceManager.getPlayerLobby(ctx.user!.uuid)

    if (existingUserLobby !== null)
    {
        throw new TRPCError({
            code:"PRECONDITION_FAILED",
            message:"User is already in lobby",
            cause:{
                lobby:{
                    id:existingUserLobby.id
                }
            }
        })
    }

    return next()
})