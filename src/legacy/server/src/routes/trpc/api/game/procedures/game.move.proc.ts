import { z } from "zod"
import { TRPCError } from "@trpc/server";
import { GAMEPROCEDURE } from "../game.proc";
import { trpcGameIsPresentMiddleware } from "../middleware/game.isPresent.mw";
import { zodIsTileValidator } from "../zod/game.isTile.zod";
import { zodIsPromotionPieceValidator } from "../zod/game.isPromotionPiece";
import { GameInstanceManager } from "../../../../../game/GameInstanceManager";
import { GameInstance } from "../../../../../game/GameInstance";


export const trpcGameMoveProcedure =  GAMEPROCEDURE
    .use(trpcGameIsPresentMiddleware)
    .input(z.object({
        move:z.object({
            source:zodIsTileValidator,
            target:zodIsTileValidator,
        }),
        promotion:z.optional(zodIsPromotionPieceValidator)
    }))
    .mutation(({ctx,input}) => {
        const targetGame = GameInstanceManager.getPlayerGame(ctx.user!.uuid) as GameInstance
        const {move, promotion} = input

        if (!targetGame.isPlayerTurn(ctx.user!.uuid))
        {
            throw new TRPCError({
                code:"FORBIDDEN",
                message:"incorrect turn"
            })
        }

        if (!targetGame.isValidMove(move.source, move.target, promotion))
        {
            throw new TRPCError({
                code:"FORBIDDEN",
                message:"invalid move"
            })
        }

        targetGame.move(move.source, move.target, promotion)

        return {
            success:true
        }
    })