import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { GameSnapshot } from "~/types/game.types";
import { GameEvent } from "~/lib/ws/events/client/game/game.events.ws";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";

export type GameJoinEvent = EmitEventType<
  `${GameEvent.GAME_JOIN}`,
  GameSnapshot
>;

export const emitGameJoinEvent = (
  sockets: EmitSocketOptions,
  game: ExtractEmitData<GameJoinEvent>,
) => {
  emit<GameJoinEvent>(sockets, {
    event: GameEvent.GAME_JOIN,
    data: game,
  });
};
