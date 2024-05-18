import { EmitSocketOptions, emit } from "~/lib/ws/emit.ws";
import { EmitEventType } from "~/lib/ws/events.ws.types";
import { DevEvent } from "~/lib/ws/events/client/dev/dev.events.ws";

export type DevTestEvent = EmitEventType<
  `${DevEvent.DEV_TEST}`,
  {
    message?: string;
  }
>;

export const emitDevTestEvent = (
  sockets: EmitSocketOptions,
  data: DevTestEvent["data"],
) => {
  emit<DevTestEvent>(sockets, {
    event: DevEvent.DEV_TEST,
    data: data,
  });
};
