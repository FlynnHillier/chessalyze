import { GameEmitEvent } from "~/lib/ws/events/client/game/game.events.ws";
import { DevEmitEvent } from "~/lib/ws/events/client/dev/dev.events.ws";
import { LobbyEmitEvent } from "~/lib/ws/events/client/lobby/lobby.events.ws";
import { SummaryEmitEvents } from "~/lib/ws/events/client/summary/summary.event.ws";

/**
 * Messages that are sent from the server to the client
 *
 */
export type IncomingClientWSMessage =
  | GameEmitEvent
  | DevEmitEvent
  | LobbyEmitEvent
  | SummaryEmitEvents;
