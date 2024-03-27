import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameSnapshot } from "~/types/game.types";
import { GameEvent } from "../game.event.ws";
import { Room } from "~/lib/ws/rooms.ws";

export type GameJoinEvent = EmitEventType<
  `${GameEvent.GAME_JOIN}`,
  GameSnapshot
>;

export const emitGameJoinEvent = (
  room: Room,
  game: ExtractEmitData<GameJoinEvent>,
) => {
  room.emit<GameJoinEvent>({
    event: GameEvent.GAME_JOIN,
    data: game,
  });
};
