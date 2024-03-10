import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "~/server/api/trpc";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";

export const trpcGameIsPresentMiddleware = createTRPCMiddleware(({ ctx, next }) => {
    const { id } = ctx.session!.user

    const existingGame = GameInstanceManager.getPlayerGame(id)

    if (existingGame === null) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "User is not in game"
        })
    }

    return next()
})