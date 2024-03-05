import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "~/server/api/trpc";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";

export const trpcGameIsNotPresentMiddleware = createTRPCMiddleware(({ ctx, next }) => {
    const existingGame = GameInstanceManager.getPlayerGame(ctx.session!.user.id)

    if (existingGame !== null) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "User is in game"
        })
    }

    return next()
})