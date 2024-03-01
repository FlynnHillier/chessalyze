import { t } from "../../../init.trpc"
import { TRPCError } from "@trpc/server";
import { GameInstanceManager } from "../../../../../game/GameInstanceManager";

export const trpcGameIsNotPresentMiddleware = t.middleware(({ctx, next}) => {
    const existingGame = GameInstanceManager.getPlayerGame(ctx.user!.uuid)

    if (existingGame !== null)
    {
        throw new TRPCError({
            code:"PRECONDITION_FAILED",
            message:"User is in game"
        })
    }

    return next()
})