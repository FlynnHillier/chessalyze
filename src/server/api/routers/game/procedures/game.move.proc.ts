import { TRPCError } from "@trpc/server";
import { z } from "zod"
import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc"
import { trpcGameIsPresentMiddleware } from "~/server/api/routers/game/middleware/game.isPresent.mw";
import { zodIsTileValidator } from "~/server/api/routers/game/zod/game.isTile.zod";
import { zodIsPromotionPieceValidator } from "~/server/api/routers/game/zod/game.isPromotionPiece.zod";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";
import { GameInstance } from "~/lib/game/GameInstance";


export const trpcGameMoveProcedure = GAMEPROCEDURE
    .use(trpcGameIsPresentMiddleware)
    .input(z.object({
        move: z.object({
            source: zodIsTileValidator,
            target: zodIsTileValidator,
        }),
        promotion: z.optional(zodIsPromotionPieceValidator)
    }))
    .mutation(({ ctx, input }) => {
        const { id } = ctx.session.user
        const { move, promotion } = input

        const targetGame = GameInstanceManager.getPlayerGame(id) as GameInstance

        if (!targetGame.isPlayerTurn(id)) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "incorrect turn"
            })
        }

        if (!targetGame.isValidMove(move.source, move.target, promotion)) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "invalid move"
            })
        }

        targetGame.move(move.source, move.target, promotion)

        return {
            success: true
        }
    })