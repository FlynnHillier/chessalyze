import { TRPCError } from "@trpc/server"
import { createTRPCMiddleware } from "~/server/api/trpc"
import { GameInstanceManager } from "~/lib/game/GameInstanceManager"

export const trpcLobbyIsNotPresentMiddleware = createTRPCMiddleware(({ ctx, next }) => {
    const existingUserLobby = GameInstanceManager.getPlayerLobby(ctx.session!.user.id)

    if (existingUserLobby !== null) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "User is already in lobby",
            cause: {
                lobby: {
                    id: existingUserLobby.id
                }
            }
        })
    }

    return next()
})