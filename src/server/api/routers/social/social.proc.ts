import { trpcSocialSendFriendRequestProcedure } from "~/server/api/routers/social/procedures/social.FriendRequest.proc";
import { createTRPCRouter } from "~/server/api/trpc";

export const trpcSocialRouter = createTRPCRouter({
  friendRequest: createTRPCRouter({
    send: trpcSocialSendFriendRequestProcedure,
  }),
});
