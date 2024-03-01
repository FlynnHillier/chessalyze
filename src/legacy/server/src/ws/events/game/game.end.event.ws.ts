import { EmitType } from "../../../types/event";
import { wsRoomRegistry } from "../../rooms.ws";
import { ExtractEmitData } from "../../../types/event";
import { GameEvent } from "../game.event.ws";

export type GameEndEvent = EmitType<"GAME_END", {}>

export const emitGameEndEvent = (room:string,termination:ExtractEmitData<GameEndEvent>) => {
    wsRoomRegistry.emit<GameEndEvent>(room, {
        event:GameEvent.GAME_END,
        data:termination
    })
}