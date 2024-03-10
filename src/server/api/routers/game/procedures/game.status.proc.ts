import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";

export const trpcGameStatusProcedure = GAMEPROCEDURE
    .query(({ ctx }) => {
        const { id: pid } = ctx.session.user

        const existingGame = GameInstanceManager.getPlayerGame(pid)

        if (existingGame === null) {
            return {
                present: false,
            } as const
        }

        return {
            present: true,
            game: existingGame.snapshot()
        }
    })