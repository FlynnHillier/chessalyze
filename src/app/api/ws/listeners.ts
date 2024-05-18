import { WebSocket, MessageEvent } from "ws";
import { IncomingServerWSMessage } from "~/lib/ws/events/server/server.events.ws";
import { recentGameSummarysSocketRoom } from "~/lib/ws/rooms/standalone/recentGameSummarys.room.ws";

import { z } from "zod";

/**
 * Validate that incoming ws message event's payload is in the format we want it be.
 *
 * @param e incoming message event
 */
function validateServerWSMessage(
  messageData: MessageEvent,
): false | IncomingServerWSMessage {
  try {
    const messageDataString = messageData.data.toString();

    const object = JSON.parse(messageDataString);

    z.object({
      event: z.string(),
      data: z.record(z.string(), z.any()),
    });

    //TODO: zod validation perhaps for each message data body
    return object;
  } catch (err) {
    return false;
  }
}

export function onWSMessage(messageData: MessageEvent, ws: WebSocket) {
  const validate = validateServerWSMessage(messageData);

  if (!validate) return;

  const { event, data } = validate;

  switch (event) {
    case "SUMMARY:SUBSCRIBE": {
      recentGameSummarysSocketRoom.joinSocket(ws);
      break;
    }
  }
}
