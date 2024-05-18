import { VerboseMovement } from "~/types/game.types";
import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameEvent } from "~/lib/ws/events/client/game/game.events.ws";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";

export type GameMoveEvent = EmitEventType<
  `${GameEvent.GAME_MOVE}`,
  VerboseMovement
>;

export const emitGameMoveEvent = (
  sockets: EmitSocketOptions,
  verboseMovement: ExtractEmitData<GameMoveEvent>,
) => {
  emit<GameMoveEvent>(sockets, {
    event: GameEvent.GAME_MOVE,
    data: verboseMovement,
  });
};
