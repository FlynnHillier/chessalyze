/**
 * WS Messages sent from the server to the client
 */

import { z } from "zod";
import {
  zGameSnapshot,
  zGameSummary,
  zVerboseMovement,
} from "@validators/game/game.validators";
import {
  WSMessageData,
  WSMessagesTemplate,
  ExtractWSMessageTemplateGeneric,
} from "~/lib/ws/template.ws";

export const wsServerToClientMessage = new WSMessagesTemplate({
  DEV_ID: z.object({
    id: z.string(),
  }),
  DEV_TEST: z.object({
    message: z.string().optional(),
  }),
  GAME_JOIN: zGameSnapshot,
  GAME_END: zGameSummary,
  GAME_MOVE: zVerboseMovement,
  LOBBY_END: z.object({}),
  SUMMARY_NEW: zGameSummary,
  SOCIAL_PERSONAL_UPDATE: z.object({
    playerID: z.string(),
    new_status: z.union([
      z.literal("confirmed"),
      z.literal("request_incoming"),
      z.literal("none"),
      z.literal("request_outgoing"),
    ]),
  }),
});

export type WsServerToClientMessageData<
  E extends keyof ExtractWSMessageTemplateGeneric<
    typeof wsServerToClientMessage
  >,
> = WSMessageData<typeof wsServerToClientMessage, E>;
