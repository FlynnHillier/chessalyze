import { observable } from "@trpc/server/observable";
import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { wsEmitterRegistry } from "~/lib/ws/emitters.ws";
import { GameEvent } from "~/lib/ws/events/game.event.ws";
import { GameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { ExtractEmitData } from "~/lib/ws/events.ws.types";

export const trpcGameOnJoinProcedure = GAMEPROCEDURE
    .subscription(({ ctx }) => {
        const { id: pid } = ctx.session.user

        const ee = wsEmitterRegistry.get(pid)
        return observable<ExtractEmitData<GameJoinEvent>>(emit => {
            ee.on(GameEvent.GAME_JOIN, emit.next)

            return () => {
                ee.off(GameEvent.GAME_JOIN, emit.next)
            }
        })
    })