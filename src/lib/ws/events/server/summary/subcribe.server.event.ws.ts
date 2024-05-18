import { EmitEventType } from "~/lib/ws/events.ws.types";

export type ServerWSEventSubscribeSummaryUpdates = EmitEventType<
  "SUMMARY:SUBSCRIBE",
  {}
>;
