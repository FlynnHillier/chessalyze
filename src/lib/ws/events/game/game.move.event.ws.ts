import { BW, PromotionSymbol, Square } from "~/types/game.types";
import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { wsRoomRegistry } from "../../rooms.ws";
import { GameEvent } from "../game.event.ws";

export type GameMoveEvent = EmitEventType<`${GameEvent.GAME_MOVE}`, {
    move: {
        source: Square,
        target: Square,
        promotion?: PromotionSymbol
    },
    time: {
        isTimed: boolean,
        remaining: BW<number>
    }
}>

export const emitGameMoveEvent = (room: string, move: ExtractEmitData<GameMoveEvent>) => {
    wsRoomRegistry.emit<GameMoveEvent>(room, {
        event: GameEvent.GAME_MOVE,
        data: move
    })
}