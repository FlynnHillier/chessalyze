/**
 * WS Messages sent from the server to the client
 */

import { z } from "zod";
import {
  zBW,
  zColor,
  zGameSnapshot,
  zGameSummary,
  zGameTimePreset,
  zVerboseMovement,
} from "@validators/game/game.validators";
import {
  WSMessageData,
  WSMessagesTemplate,
  ExtractWSMessageTemplateGeneric,
} from "~/lib/ws/template.ws";
import { zVerboseLobbySnapshot } from "~/lib/zod/lobby/lobby.validators";

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
  "LOBBY:END": z.object({}),
  "LOBBY:UPDATE": zVerboseLobbySnapshot,
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
  "SOCIAL:FRIEND_NEW": z.object({
    user: z.object({
      id: z.string(),
      username: z.string(),
      imageURL: z.string().optional(),
    }),
    activity: z.object({
      isOnline: z.boolean(),
    }),
  }),
  "PROFILE_VIEW:ACTIVITY_STATUS_UPDATE": z.object({
    playerID: z.string(),
    status: z.object({
      gameID: z.string().optional(),
      isOnline: z.boolean(),
      messages: z.object({
        primary: z.string().optional(),
        secondary: z.string().optional(),
      }),
    }),
  }),
  "PROFILE:NEW_GAME_SUMMARY": zGameSummary,
});

export type WsServerToClientMessageData<
  E extends keyof ExtractWSMessageTemplateGeneric<
    typeof wsServerToClientMessage
  >,
> = WSMessageData<typeof wsServerToClientMessage, E>;
