import { GameEvent } from "~/lib/ws/events/client/game/game.events.ws";
import { ExtractEmitData, EmitEventType } from "~/lib/ws/events.ws.types";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";
import { GameSummary } from "~/types/game.types";

export type GameEndEvent = EmitEventType<`${GameEvent.GAME_END}`, GameSummary>;

export const emitGameEndEvent = (
  sockets: EmitSocketOptions,
  termination: ExtractEmitData<GameEndEvent>,
) => {
  emit<GameEndEvent>(sockets, {
    event: GameEvent.GAME_END,
    data: termination,
  });
};
