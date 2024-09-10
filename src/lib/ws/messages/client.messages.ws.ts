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
import {
  zNonVerboseLobbySnapshot,
  zVerboseLobbySnapshot,
} from "~/lib/zod/lobby/lobby.validators";
import {
  zSocialActivity,
  zSocialUser,
  zVerboseSocialUser,
} from "~/lib/zod/social/social.validators";

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
  "LOBBY:INVITE_RECEIVED": z.object({
    user: zSocialUser,
    lobbyPreview: zNonVerboseLobbySnapshot,
  }),
  "LOBBY:END": z.object({}),
  "LOBBY:UPDATE": zVerboseLobbySnapshot,
  SUMMARY_NEW: zGameSummary,
  "SOCIAL:FRIEND_NEW": zVerboseSocialUser,
  "SOCIAL:INCOMING_FRIEND_REQUEST": zSocialUser,
  /**
   * Fires when a user's friend relation with another user is updated. E.g confirmed -> none / none -> request_outgoing
   */
  "SOCIAL:FRIEND_RELATION_UPDATE": z.object({
    targetUserID: z.string(),
    new_relation: z.union([
      z.literal("confirmed"),
      z.literal("request_incoming"),
      z.literal("none"),
      z.literal("request_outgoing"),
    ]),
  }),
  "SOCIAL:FRIEND_ACTIVITY_UPDATE": z.object({
    targetUserID: z.string(),
    activity: zSocialActivity,
  }),
  "PROFILE_VIEW:ACTIVITY_STATUS_UPDATE": z.object({
    playerID: z.string(),
    status: zSocialActivity,
  }),
  "PROFILE:NEW_GAME_SUMMARY": zGameSummary,
});

export type WsServerToClientMessageData<
  E extends keyof ExtractWSMessageTemplateGeneric<
    typeof wsServerToClientMessage
  >,
> = WSMessageData<typeof wsServerToClientMessage, E>;
