import { Room, wsRoomRegistry } from "~/lib/ws/rooms.ws";
import { GameEvent } from "~/lib/ws/events/game.event.ws";
import { ExtractEmitData, EmitEventType } from "~/lib/ws/events.ws.types";

export type GameEndEvent = EmitEventType<"GAME_END", {}>;

export const emitGameEndEvent = (
  room: Room,
  termination: ExtractEmitData<GameEndEvent>,
) => {
  room.emit<GameEndEvent>({
    event: GameEvent.GAME_END,
    data: termination,
  });
};
