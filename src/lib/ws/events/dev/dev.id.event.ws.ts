import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";
import { EmitEventType } from "~/lib/ws/events.ws.types";
import { DevEvent } from "~/lib/ws/events/dev/dev.events.ws";

export type DevIDEvent = EmitEventType<
  `${DevEvent.DEV_ID}`,
  {
    id: string;
  }
>;

export const emitDevIDEvent = (
  sockets: EmitSocketOptions,
  data: DevIDEvent["data"],
) => {
  emit<DevIDEvent>(sockets, {
    event: DevEvent.DEV_ID,
    data: data,
  });
};
