import { WebSocket } from "ws";
import { EmitEvent } from "~/lib/ws/events.ws";

/**
 * Standardise transfer of event data
 */
export function emit<E extends EmitEvent>(socket: WebSocket, event: E) {
  console.log("emitting!", event);

  console.log();

  socket.send(
    JSON.stringify({
      event: event.event,
      data: event.data,
    }),
  );
}
