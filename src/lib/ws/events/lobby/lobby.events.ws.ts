import { LobbyEndEvent } from "~/lib/ws/events/lobby/lobby.end.event.ws";

export enum LobbyEvent {
  LOBBY_END = "LOBBY_END",
}

export type LobbyEmitEvent = LobbyEndEvent;
