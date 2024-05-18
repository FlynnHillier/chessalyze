import { ExtractEmitData, EmitEventType } from "~/lib/ws/events.ws.types";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";
import { LobbyEvent } from "~/lib/ws/events/client/lobby/lobby.events.ws";

export type LobbyEndEvent = EmitEventType<`${LobbyEvent.LOBBY_END}`, {}>;

export const emitLobbyEndEvent = (
  sockets: EmitSocketOptions,
  termination: ExtractEmitData<LobbyEndEvent>,
) => {
  emit<LobbyEndEvent>(sockets, {
    event: LobbyEvent.LOBBY_END,
    data: termination,
  });
};
