import { GameEndEvent } from "./game/game.end.event.ws"
import { GameJoinEvent } from "./game/game.join.event.ws"
import { GameMoveEvent } from "./game/game.move.event.ws"


export enum GameEvent {
    GAME_JOIN = "GAME_JOIN",
    GAME_END = "GAME_END",
    GAME_MOVE = "GAME_MOVE",
}


export type GameEmitEvent = GameEndEvent
| GameMoveEvent
| GameJoinEvent