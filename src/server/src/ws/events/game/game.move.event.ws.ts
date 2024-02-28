import { Square } from "chess.js";
import { BW, PromotionSymbol } from "@common/src/types/game";
import { wsRoomRegistry } from "../../rooms.ws";
import { EmitType, ExtractEmitData } from "../../../types/event";
import { GameEvent } from "../game.event.ws";

export type GameMoveEvent = EmitType<`${GameEvent.GAME_MOVE}`, {
    move:{
        source:Square,
        target:Square,
        promotion?:PromotionSymbol
    },
    time:{
        isTimed:boolean,
        remaining:BW<number>
    }
}>

export const emitGameMoveEvent = (room:string,move:ExtractEmitData<GameMoveEvent>) => {
    wsRoomRegistry.emit<GameMoveEvent>(room, {
        event:GameEvent.GAME_MOVE,
        data:move
    })
}