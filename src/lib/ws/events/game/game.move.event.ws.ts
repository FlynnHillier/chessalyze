import { BW, Movement, PromotionSymbol, Square } from "~/types/game.types";
import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameEvent } from "~/lib/ws/events/game/game.events.ws";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";

export type GameMoveEvent = EmitEventType<
  `${GameEvent.GAME_MOVE}`,
  {
    move: Movement;
    time: {
      isTimed: boolean;
      remaining: BW<number>;
    };
  }
>;

export const emitGameMoveEvent = (
  sockets: EmitSocketOptions,
  move: ExtractEmitData<GameMoveEvent>,
) => {
  emit<GameMoveEvent>(sockets, {
    event: GameEvent.GAME_MOVE,
    data: move,
  });
};
