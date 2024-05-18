import { EmitEventType, ExtractEmitData } from "~/lib/ws/events.ws.types";
import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";
import { SummaryEvent } from "~/lib/ws/events/client/summary/summary.event.ws";
import { GameSummary } from "~/types/game.types";

export type WSClientEvent_SummaryNew = EmitEventType<
  `${SummaryEvent.NEW}`,
  GameSummary
>;

export const emitClientWS_NewSummary = (
  sockets: EmitSocketOptions,
  summary: ExtractEmitData<WSClientEvent_SummaryNew>,
) => {
  emit<WSClientEvent_SummaryNew>(sockets, {
    event: SummaryEvent.NEW,
    data: summary,
  });
};
