import { observable } from "@trpc/server/observable";
import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { wsEmitterRegistry } from "~/lib/ws/emitters.ws";
import { GameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";
import { ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameEvent } from "~/lib/ws/events/game.event.ws";


export const trpcGameOnMoveProcedure = GAMEPROCEDURE
    .subscription(({ ctx }) => {
        const { id: pid } = ctx.session.user

        const ee = wsEmitterRegistry.get(pid)

        return observable<ExtractEmitData<GameMoveEvent>>(emit => {
            ee.on(GameEvent.GAME_MOVE, emit.next)

            return () => {
                ee.off(GameEvent.GAME_MOVE, emit.next)
            }
        })
    })