import { GameEvent } from "~/lib/ws/events/game/game.events.ws";
import { ExtractEmitData, EmitEventType } from "~/lib/ws/events.ws.types";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";

export type GameEndEvent = EmitEventType<"GAME_END", {}>;

export const emitGameEndEvent = (
  sockets: EmitSocketOptions,
  termination: ExtractEmitData<GameEndEvent>,
) => {
  emit<GameEndEvent>(sockets, {
    event: GameEvent.GAME_END,
    data: termination,
  });
};
