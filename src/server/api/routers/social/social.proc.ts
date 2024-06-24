import z from "zod";
import { TRPCError } from "@trpc/server";

import { SOCIALPROCEDURE } from "~/server/api/routers/social/social.trpc";
import { createTRPCRouter } from "~/server/api/trpc";
import DrizzleSocialTransaction from "~/lib/drizzle/transactions/social.transactions.drizzle";

export const trpcSocialRouter = createTRPCRouter({
  friend: createTRPCRouter({
    request: createTRPCRouter({
      send: SOCIALPROCEDURE.input(
        z.object({ targetUserID: z.string() }),
      ).mutation(async ({ input, ctx }) => {
        if (input.targetUserID === ctx.user.id)
          throw new TRPCError({
            message: "cannot send friend request to self",
            code: "FORBIDDEN",
          });

        const { success, meta } = await new DrizzleSocialTransaction(
          ctx.user.id,
        ).sendUserFriendRequest(input.targetUserID);

        return {
          success,
          message:
            !success && meta?.isNonExistentTargetUserError
              ? "user not found"
              : undefined,
        };
      }),
      accept: SOCIALPROCEDURE.input(
        z.object({ targetUserID: z.string() }),
      ).mutation(async ({ input, ctx }) => {
        const { success, meta } = await new DrizzleSocialTransaction(
          ctx.user.id,
        ).acceptUserFriendRequest(input.targetUserID);

        return {
          success,
          message:
            !success && meta?.isNonExistentTargetUserError
              ? "user not found"
              : undefined,
        };
      }),
      rejectIncoming: SOCIALPROCEDURE.input(
        z.object({ targetUserID: z.string() }),
      ).mutation(async ({ input, ctx }) => {
        const { success, meta } = await new DrizzleSocialTransaction(
          ctx.user.id,
        ).cancelIncomingFriendRequest(input.targetUserID);

        return {
          success,
          message:
            !success && meta?.isNonExistentTargetUserError
              ? "user not found"
              : undefined,
        };
      }),
      cancelOutgoing: SOCIALPROCEDURE.input(
        z.object({ targetUserID: z.string() }),
      ).mutation(async ({ input, ctx }) => {
        const { success, meta } = await new DrizzleSocialTransaction(
          ctx.user.id,
        ).cancelOutgoingFriendRequest(input.targetUserID);

        return {
          success,
          message:
            !success && meta?.isNonExistentTargetUserError
              ? "user not found"
              : undefined,
        };
      }),
    }),
  }),
});
