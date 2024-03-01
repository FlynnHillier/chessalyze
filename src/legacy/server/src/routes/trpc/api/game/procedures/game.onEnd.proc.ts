import { GAMEPROCEDURE } from "../game.proc";
import { observable } from "@trpc/server/observable";
import { wsEmitterRegistry } from "../../../../../ws/emitters.ws";
import { GameEndEvent } from "../../../../../ws/events/game/game.end.event.ws";
import { GameEvent } from "../../../../../ws/events/game.event.ws";
import { ExtractEmitData } from "../../../../../types/event";


export const trpcGameOnEndProcedure = GAMEPROCEDURE
    .subscription(({ctx}) => {
        console.log("using game end subscription")
        console.log(ctx.user?.uuid)
        const ee = wsEmitterRegistry.get(ctx.user!.uuid)
        console.log(ee)
        console.log("Hi")

        return observable<ExtractEmitData<GameEndEvent>>(emit => {
            console.log(ee)
            ee.on(GameEvent.GAME_END,emit.next)
            
            return () => {
                ee.off(GameEvent.GAME_END,emit.next)
            }
        })
    })