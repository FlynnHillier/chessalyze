import { GameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";
import { GameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { GameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";

export enum GameEvent {
  GAME_JOIN = "GAME_JOIN",
  GAME_END = "GAME_END",
  GAME_MOVE = "GAME_MOVE",
}

export type GameEmitEvent = GameEndEvent | GameMoveEvent | GameJoinEvent;
