import { TRPCError } from "@trpc/server";
import { z } from "zod";
import DrizzleSocialTransaction from "~/lib/drizzle/transactions/social.transactions.drizzle";
import { SOCIALPROCEDURE } from "~/server/api/routers/social/social.trpc";

/**
 * Allow user to initiate friend request to another user
 */
export const trpcSocialSendFriendRequestProcedure = SOCIALPROCEDURE.input(
  z.object({ targetID: z.string() }),
).mutation(async ({ input, ctx }) => {
  if (input.targetID === ctx.user.id)
    throw new TRPCError({
      message: "cannot send friend request to self",
      code: "FORBIDDEN",
    });

  const result = await new DrizzleSocialTransaction(
    ctx.user.id,
  ).sendUserFriendRequest(input.targetID);

  return {
    success: result,
  };
});
