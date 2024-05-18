import { WSClientEvent_SummaryNew } from "~/lib/ws/events/client/summary/summary.new.event.ws";

export enum SummaryEvent {
  NEW = "SUMMARY_NEW",
}

export type SummaryEmitEvents = WSClientEvent_SummaryNew;
