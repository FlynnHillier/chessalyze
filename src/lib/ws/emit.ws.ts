import { WebSocket } from "ws";
import { env } from "~/env";
import { EmitEvent } from "~/lib/ws/events.ws";
import { AtleastOneKey } from "~/types/util/util.types";
import {
  logDev,
  loggingCategories,
  loggingColourCode,
} from "~/lib/logging/dev.logger";
import { SocketRoom } from "~/lib/ws/rooms.ws";

export type EmitSocketOptions = AtleastOneKey<{
  room: SocketRoom;
  socket: WebSocket;
}>;

/**
 * Standardise transfer of event data
 * @returns number of socket instances emitted to
 */
export function emit<E extends EmitEvent>(
  { room, socket }: EmitSocketOptions,
  event: E,
): number {
  const payload = JSON.stringify({
    event: event.event,
    data: event.data,
  });
  const sockets = new Set<WebSocket>();

  room?.sockets().forEach((socket) => {
    sockets.add(socket);
  });

  socket && sockets.add(socket);

  logDev({
    message: [
      `emitting '${event.event}' to ${sockets.size} socket instance(s) : `,
      "[ " +
        Array.from(sockets)
          .map((s) => `id:${s.id} state:${s.readyState}`)
          .join(", ") +
        " ]",
    ],
    color: loggingColourCode.FgBlue,
    category: loggingCategories.socket,
  });

  sockets.forEach((socket) => {
    socket.send(payload);
  });

  return sockets.size;
}
