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
  getUserIncomingFriendRequests,
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
import { ActivityManager } from "~/lib/social/activity.social";
import { db } from "~/lib/drizzle/db";
import { log } from "~/lib/logging/logger.winston";
import { SocialUser, VerboseSocialUser } from "~/types/social.types";

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

async function emitNewFriendEvent(user1_ID: string, user2_ID: string) {
  // This is only used once, but is necessary because need to get other user information. Activity Manager only works with reference to user ID.

  try {
    const u1 = await db.query.users.findFirst({
      where: eq(users.id, user1_ID),
      columns: {
        id: true,
        image: true,
        name: true,
      },
    });

    const u2 = await db.query.users.findFirst({
      where: eq(users.id, user2_ID),
      columns: {
        id: true,
        image: true,
        name: true,
      },
    });

    if (!u1 || !u2) {
      return log("social").warn(
        `failed to emit new friend event to users '${user1_ID}' & '${user2_ID}'. One of the users did not exist!`,
      );
    }

    wsServerToClientMessage
      .send("SOCIAL:FRIEND_NEW")
      .data({
        user: {
          id: u1.id,
          username: u1.name,
          imageURL: u1.image ?? undefined,
        },
        activity: ActivityManager.getActivity(user1_ID).getSocialActivity(),
      })
      .to({
        socket: wsSocketRegistry.get(u2.id),
      })
      .emit();

    wsServerToClientMessage
      .send("SOCIAL:FRIEND_NEW")
      .data({
        user: {
          id: u2.id,
          username: u2.name,
          imageURL: u2.image ?? undefined,
        },
        activity: ActivityManager.getActivity(user2_ID).getSocialActivity(),
      })
      .to({
        socket: wsSocketRegistry.get(u1.id),
      })
      .emit();
  } catch (e) {
    log("social").error(
      `failed to emit new friend event to users '${user1_ID}' & '${user2_ID}'. `,
      e,
    );
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
      const users: VerboseSocialUser[] = (
        await getUserConfirmedFriends(ctx.user.id)
      ).map(({ id, image, name }) => ({
        user: { id, imageURL: image ?? undefined, username: name },
        activity: ActivityManager.getActivity(id).getSocialActivity(),
      }));

      return users;
    }),
    getAllIncomingFriendRequests: protectedProcedure.query(async ({ ctx }) => {
      const IncomingFriendRequestUsers: SocialUser[] = (
        await getUserIncomingFriendRequests(ctx.user.id)
      ).map(({ id, image, name }) => ({
        id,
        username: name,
        imageURL: image ?? undefined,
      }));

      return IncomingFriendRequestUsers;
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
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({
                targetUserID: input.targetUserID,
                new_relation: "none",
              })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({
                targetUserID: ctx.user.id,
                new_relation: "none",
              })
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
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({
                targetUserID: input.targetUserID,
                new_relation: "request_outgoing",
              })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({
                targetUserID: ctx.user.id,
                new_relation: "request_incoming",
              })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:INCOMING_FRIEND_REQUEST")
              .data({
                id: ctx.user.id,
                username: ctx.user.name,
                imageURL: ctx.user.image ?? undefined,
              })
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
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({
                targetUserID: input.targetUserID,
                new_relation: "confirmed",
              })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({ targetUserID: ctx.user.id, new_relation: "confirmed" })
              .to({ socket: wsSocketRegistry.get(input.targetUserID) })
              .emit();

            emitNewFriendEvent(input.targetUserID, ctx.user.id);
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
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({ targetUserID: input.targetUserID, new_relation: "none" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({ targetUserID: ctx.user.id, new_relation: "none" })
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
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({ targetUserID: input.targetUserID, new_relation: "none" })
              .to({ socket: wsSocketRegistry.get(ctx.user.id) })
              .emit();

            wsServerToClientMessage
              .send("SOCIAL:FRIEND_RELATION_UPDATE")
              .data({ targetUserID: ctx.user.id, new_relation: "none" })
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
