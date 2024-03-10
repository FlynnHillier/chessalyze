import { observable } from "@trpc/server/observable";
import { GAMEPROCEDURE } from "../game.proc";
import { wsEmitterRegistry } from "~/lib/ws/emitters.ws";
import { GameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";
import { ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameEvent } from "~/lib/ws/events/game.event.ws";

export const trpcGameOnEndProcedure = GAMEPROCEDURE
    .subscription(({ ctx }) => {
        const { id: pid } = ctx.session.user

        const ee = wsEmitterRegistry.get(pid)

        return observable<ExtractEmitData<GameEndEvent>>(emit => {
            ee.on(GameEvent.GAME_END, emit.next)

            return () => {
                ee.off(GameEvent.GAME_END, emit.next)
            }
        })
    })