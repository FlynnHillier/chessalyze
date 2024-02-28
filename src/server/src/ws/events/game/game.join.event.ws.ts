import { EmitType } from "../../../types/event";
import { wsRoomRegistry } from "../../rooms.ws";
import { GameSnapshot } from "@common/src/types/game";
import { ExtractEmitData } from "../../../types/event";
import { GameEvent } from "../game.event.ws";

export type GameJoinEvent = EmitType<`${GameEvent.GAME_JOIN}`,GameSnapshot>

export const emitGameJoinEvent = (room:string,game:ExtractEmitData<GameJoinEvent>) => {
    wsRoomRegistry.emit<GameJoinEvent>(room, {
        event:GameEvent.GAME_JOIN,
        data:game
    })
}