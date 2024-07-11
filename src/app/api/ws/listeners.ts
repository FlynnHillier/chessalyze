import { WebSocket } from "ws";
import { log } from "~/lib/logging/logger.winston";
import { ActivityManager } from "~/lib/social/activity.social";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { getOrCreateProfileViewSocketRoom } from "~/lib/ws/rooms/categories/profile.room.ws";
import { recentGameSummarysSocketRoom } from "~/lib/ws/rooms/standalone/recentGameSummarys.room.ws";

export function onWsClientToServerMessage(ws: WebSocket) {
  return wsClientToServerMessage.receiver({
    SUMMARY_SUBSCRIBE: () => {
      log("profile").debug(
        `subscribing a client to receive updates for all recent game summarys`,
      );

      recentGameSummarysSocketRoom.joinSocket(ws);
    },
    "PROFILE:ACTIVITY_SUBSCRIBE": ({ profileUserID }) => {
      log("profile").debug(
        `subscribing a client to receive updates for profile ${profileUserID}`,
      );

      getOrCreateProfileViewSocketRoom({ playerID: profileUserID }).joinSocket(
        ws,
      );
    },
    "PROFILE:ACTIVITY_UNSUBSCRIBE": ({ profileUserID }) => {
      log("profile").debug(
        `unsubscribing a client to receive updates for profile ${profileUserID}`,
      );

      getOrCreateProfileViewSocketRoom({ playerID: profileUserID }).leaveSocket(
        ws,
      );
    },
    HEARTBEAT: ({ timestamp }) => {
      const userID = wsSocketRegistry.identifySocket(ws);
      if (!userID) return;

      ActivityManager._eventHooks.onHeartbeat(userID);
    },
  });
}
