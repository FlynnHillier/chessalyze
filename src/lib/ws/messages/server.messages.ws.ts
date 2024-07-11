/**
 * WS Messages sent from the client to the server
 */

import { z } from "zod";
import {
  WSMessageData,
  WSMessagesTemplate,
  ExtractWSMessageTemplateGeneric,
} from "~/lib/ws/template.ws";

export const wsClientToServerMessage = new WSMessagesTemplate({
  HEARTBEAT: z.object({
    timestamp: z.number(),
  }),
  "PROFILE:RECENT_GAMES:SUBSCRIBE": z.object({
    profile: z.object({
      id: z.string(),
    }),
  }),

  SUMMARY_SUBSCRIBE: z.object({}),
  "PROFILE:ACTIVITY_SUBSCRIBE": z.object({
    profileUserID: z.string(),
  }),
  "PROFILE:ACTIVITY_UNSUBSCRIBE": z.object({
    profileUserID: z.string(),
  }),
});

export type WsClientToServerMessageData<
  E extends keyof ExtractWSMessageTemplateGeneric<
    typeof wsClientToServerMessage
  >,
> = WSMessageData<typeof wsClientToServerMessage, E>;
