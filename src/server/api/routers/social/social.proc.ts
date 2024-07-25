import z from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import DrizzleSocialTransaction from "~/lib/drizzle/transactions/social.transactions.drizzle";
import {
  getFriendRelation,
  getUserConfirmedFriends,
} from "~/lib/drizzle/queries/social.queries.drizzle";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { users } from "~/lib/drizzle/auth.schema";
import { countDistinct, eq, or } from "drizzle-orm";
import {
  drizzleGameSummaryWithQuery,
  pgGameSummaryQueryResultToGameSummary,
} from "~/lib/drizzle/transactions/game.drizzle";
import { games } from "~/lib/drizzle/games.schema";
import { trpcSocialProfileProcedure } from "~/server/api/routers/social/social.profile.proc";

class UserNotExistError extends TRPCError {
  constructor(playerID: string) {
    super({ code: "NOT_FOUND", message: `user ${playerID} does not exist` });
  }
}

class FriendshipExistsError extends TRPCError {
  constructor() {
    super({
      code: "CONFLICT",
      message: "already friends or a request has already been sent/received.",
    });
  }
}

class FriendshipNotExistsError extends TRPCError {
  constructor() {
    super({
      code: "CONFLICT",
      message: "not currently friends.",
    });
  }
}

class FriendRequestExistsError extends TRPCError {
  constructor() {
    super({ code: "CONFLICT", message: "friend request already exists." });
  }
}

class FriendRequestNotExistsError extends TRPCError {
  constructor() {
    super({ code: "CONFLICT", message: "friend request does not exist." });
  }
}

export const trpcSocialRouter = createTRPCRouter({
  profile: createTRPCRouter({
    user: trpcSocialProfileProcedure,
    games: createTRPCRouter({
      infiniteScroll: publicProcedure
        .input(
          z.object({
            profile: z.object({
              id: z.string(),
            }),
            start: z.number().min(0),
            count: z.number().min(0).max(20).default(10),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          const { db } = ctx;

          const pgResult = await db.query.games.findMany({
            with: drizzleGameSummaryWithQuery,
            where: or(
              eq(games.p_black_id, input.profile.id),
              eq(games.p_white_id, input.profile.id),
            ),
            limit: input.count,
            orderBy: (games, { desc }) => [desc(games.serial)],
            offset: input.start,
          });

          const summarys = pgResult.map(pgGameSummaryQueryResultToGameSummary);

          const summaryCountRes = await db
            .select({ count: countDistinct(games.id) })
            .from(games)
            .innerJoin(
              users,
              or(
                eq(games.p_black_id, input.profile.id),
                eq(games.p_white_id, input.profile.id),
              ),
            );

          const summaryCount = summaryCountRes[0].count;

          const isMore = input.start + input.count < summaryCount;

          return {
            isMore: isMore,
            tail: isMore ? input.start + input.count : summaryCount,
            data: summarys,
          };
        }),
    }),
    friendRelation: protectedProcedure
      .input(z.object({ targetUserID: z.string() }))
      .query(async ({ ctx, input }) => {
        const userFriends = await getFriendRelation(
          input.targetUserID,
          ctx.user.id,
        );

        const relation:
          | "none"
          | "confirmed"
          | "requestIncoming"
          | "requestOutgoing" = !userFriends
          ? "none"
          : userFriends.status === "confirmed"
            ? "confirmed"
            : userFriends.pending_accept === ctx.user.id
              ? "requestIncoming"
              : "requestOutgoing";

        return {
          relation,
        };
      }),
  }),
  friend: createTRPCRouter({
    getAllFriends: protectedProcedure.query(async ({ ctx }) => {
      return (await getUserConfirmedFriends(ctx.user.id)).map(
        ({ id, image, name }) => ({ id, image, name }),
      );
    }),

    request: createTRPCRouter({
      remove: protectedProcedure
        .input(z.object({ targetUserID: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const { success, error } = await new DrizzleSocialTransaction(
            ctx.user.id,
          ).removeConfirmedFriend(input.targetUserID);

          if (!success) {
            if (error?.isFriendNotExists) throw new FriendshipNotExistsError();
            if (error?.isUserNotExists)
              throw new UserNotExistError(input.targetUserID);
          }

          if (success) {
            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: input.targetUserID, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: ctx.user.id, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();
          }

          return {
            success,
          };
        }),
      send: protectedProcedure
        .input(z.object({ targetUserID: z.string() }))
        .mutation(async ({ input, ctx }) => {
          if (input.targetUserID === ctx.user.id)
            throw new TRPCError({
              message: "cannot send friend request to self",
              code: "FORBIDDEN",
            });

          const { success, error } = await new DrizzleSocialTransaction(
            ctx.user.id,
          ).sendUserFriendRequest(input.targetUserID);

          if (!success) {
            if (error?.isUserNotExists)
              throw new UserNotExistError(input.targetUserID);
            if (error?.isFriendshipRelationExists)
              throw new FriendshipExistsError();
            if (error?.isFriendRequestExists)
              throw new FriendRequestExistsError();
          }

          if (success) {
            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({
                playerID: input.targetUserID,
                new_status: "request_outgoing",
              })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: ctx.user.id, new_status: "request_incoming" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();
          }

          return {
            success,
          };
        }),
      acceptIncoming: protectedProcedure
        .input(z.object({ targetUserID: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const { success, error } = await new DrizzleSocialTransaction(
            ctx.user.id,
          ).acceptIncomingFriendRequest(input.targetUserID);

          if (!success) {
            if (error?.isFriendRequestNotExists)
              throw new FriendRequestNotExistsError();
            if (error?.isFriendshipRelationExists)
              throw new FriendshipExistsError();
            if (error?.isUserNotExists)
              throw new UserNotExistError(input.targetUserID);
          }

          if (success) {
            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: input.targetUserID, new_status: "confirmed" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: ctx.user.id, new_status: "confirmed" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();
          }

          return {
            success,
          };
        }),
      rejectIncoming: protectedProcedure
        .input(z.object({ targetUserID: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const { success, error } = await new DrizzleSocialTransaction(
            ctx.user.id,
          ).rejectIncomingFriendRequest(input.targetUserID);

          if (!success) {
            if (error?.isFriendRequestNotExists)
              throw new FriendRequestNotExistsError();
            if (error?.isUserNotExists)
              throw new UserNotExistError(input.targetUserID);
          }

          if (success) {
            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: input.targetUserID, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: ctx.user.id, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();
          }

          return {
            success,
          };
        }),
      cancelOutgoing: protectedProcedure
        .input(z.object({ targetUserID: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const { success, error } = await new DrizzleSocialTransaction(
            ctx.user.id,
          ).cancelOutgoingFriendRequest(input.targetUserID);

          if (!success) {
            if (error?.isFriendRequestNotExists)
              throw new FriendRequestNotExistsError();
            if (error?.isUserNotExists)
              throw new UserNotExistError(input.targetUserID);
          }

          if (success) {
            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: input.targetUserID, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL_PERSONAL_UPDATE")
              .data({ playerID: ctx.user.id, new_status: "none" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();
          }

          return {
            success,
          };
        }),
    }),
  }),
});
