import { TRPCError } from "@trpc/server";
import { z } from "zod"
import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";


export const trpcLobbyJoinProcedure = LOBBYPROCEDURE
    .use(trpcGameIsNotPresentMiddleware)
    .input(z.object({
        lobby: z.object({
            id: z.string(),
        })
    }))
    .mutation(({ ctx, input }) => {
        const { id: lobbyID } = input.lobby
        const { id: pid } = ctx.session.user

        const existingUserLobby = GameInstanceManager.getPlayerLobby(pid)

        const joinedGame = GameInstanceManager.joinLobby({
            targetLobbyID: lobbyID,
            player: {
                pid: pid,
            }
        })

        if (joinedGame === null) {
            //Game join was unsuccessful
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Target lobby was not found or is no longer available."
            })
        }

        if (existingUserLobby && joinedGame !== null) {
            //if player was already in a lobby, and game join was successful - end previous lobby.
            GameInstanceManager.endLobby(existingUserLobby.id)
        }

        return {
            game: joinedGame.snapshot()
        }
    })