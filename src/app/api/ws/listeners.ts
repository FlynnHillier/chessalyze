import { WebSocket } from "ws";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { recentGameSummarysSocketRoom } from "~/lib/ws/rooms/standalone/recentGameSummarys.room.ws";

export function onWsClientToServerMessage(ws: WebSocket) {
  return wsClientToServerMessage.receiver({
    SUMMARY_SUBSCRIBE: () => {
      recentGameSummarysSocketRoom.joinSocket(ws);
    },
  });
}
