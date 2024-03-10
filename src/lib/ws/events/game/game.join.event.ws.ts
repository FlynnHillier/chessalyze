import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameSnapshot } from "~/types/game.types";
import { wsRoomRegistry } from "../../rooms.ws";
import { GameEvent } from "../game.event.ws";

export type GameJoinEvent = EmitEventType<`${GameEvent.GAME_JOIN}`, GameSnapshot>

export const emitGameJoinEvent = (room: string, game: ExtractEmitData<GameJoinEvent>) => {
    wsRoomRegistry.emit<GameJoinEvent>(room, {
        event: GameEvent.GAME_JOIN,
        data: game
    })
}