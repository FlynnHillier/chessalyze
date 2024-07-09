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
  SUMMARY_SUBSCRIBE: z.object({}),
  PROFILE_VIEW_SUBSCRIBE: z.object({
    profileUserID: z.string(),
  }),
});

export type WsClientToServerMessageData<
  E extends keyof ExtractWSMessageTemplateGeneric<
    typeof wsClientToServerMessage
  >,
> = WSMessageData<typeof wsClientToServerMessage, E>;
