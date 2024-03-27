import { BW, PromotionSymbol, Square } from "~/types/game.types";
import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameEvent } from "../game.event.ws";
import { Room } from "~/lib/ws/rooms.ws";

export type GameMoveEvent = EmitEventType<
  `${GameEvent.GAME_MOVE}`,
  {
    move: {
      source: Square;
      target: Square;
      promotion?: PromotionSymbol;
    };
    time: {
      isTimed: boolean;
      remaining: BW<number>;
    };
  }
>;

export const emitGameMoveEvent = (
  room: Room,
  move: ExtractEmitData<GameMoveEvent>,
) => {
  room.emit<GameMoveEvent>({
    event: GameEvent.GAME_MOVE,
    data: move,
  });
};
