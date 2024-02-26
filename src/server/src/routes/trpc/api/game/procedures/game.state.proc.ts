import { GAMEPROCEDURE } from "../game.proc";
import { GameInstanceManager } from "../../../../../game/GameInstanceManager";

export const trpcGameStatusProcedure = GAMEPROCEDURE
    .query(({ctx}) => {
        const existingGame = GameInstanceManager.getPlayerGame(ctx.user!.uuid)

        if (existingGame === null)
        {
            return {
                present:false
            }
        }

        return {
            present:true,
            game:existingGame.snapshot()
        }
    })