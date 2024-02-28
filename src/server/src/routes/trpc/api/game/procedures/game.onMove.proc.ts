import { GAMEPROCEDURE } from "../game.proc";
import { observable } from "@trpc/server/observable";
import { wsEmitterRegistry } from "../../../../../ws/emitters.ws";
import { GameMoveEvent } from "../../../../../ws/events/game/game.move.event.ws";
import { ExtractEmitData } from "../../../../../types/event";
import { GameEvent } from "../../../../../ws/events/game.event.ws";


export const trpcGameOnMoveProcedure = GAMEPROCEDURE
    .subscription(({ctx}) => {
        const ee = wsEmitterRegistry.get(ctx.user!.uuid)

        return observable<ExtractEmitData<GameMoveEvent>>(emit => {
            ee.on(GameEvent.GAME_MOVE,emit.next)

            return () => {
                ee.off(GameEvent.GAME_MOVE,emit.next)
            }
        })
    })