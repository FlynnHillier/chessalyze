import { GAMEPROCEDURE } from "../game.proc";
import { observable } from "@trpc/server/observable";
import { wsEmitterRegistry } from "../../../../../ws/emitters.ws";
import { GameJoinEvent } from "../../../../../ws/events/game/game.join.event.ws";
import { ExtractEmitData } from "../../../../../types/event";
import { GameEvent } from "../../../../../ws/events/game.event.ws";


export const trpcGameOnJoinProcedure = GAMEPROCEDURE
    .subscription(({ctx}) => {
        const ee = wsEmitterRegistry.get(ctx.user!.uuid)

        return observable<ExtractEmitData<GameJoinEvent>>(emit => {
            ee.on(GameEvent.GAME_JOIN,emit.next)

            return () => {
                ee.off(GameEvent.GAME_JOIN,emit.next)
            }
        })
    })