import z from "zod";
import { TRPCError } from "@trpc/server";

import { SOCIALPROCEDURE } from "~/server/api/routers/social/social.trpc";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import DrizzleSocialTransaction from "~/lib/drizzle/transactions/social.transactions.drizzle";
import {
  getFriendRelation,
  getUserProfile,
} from "~/lib/drizzle/queries/social.queries.drizzle";

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
    user: publicProcedure
      .input(z.object({ targetUserID: z.string() }))
      .query(async ({ input, ctx }) => {
        const fullUserProfile = await getUserProfile(input.targetUserID);

        if (!fullUserProfile) throw new UserNotExistError(input.targetUserID);

        const { id, email, games_b, games_w, image, name } = fullUserProfile;

        const allGames = [...games_b, ...games_w];

        /**
         * Generate game stats object for profile
         */
        function gameStats() {
          return allGames.reduce(
            (acc, game) => {
              const color =
                game.p_black_id === input.targetUserID ? "asBlack" : "asWhite";

              const term =
                game.conclusion.victor_pid === null
                  ? "drawn"
                  : game.conclusion.victor_pid === input.targetUserID
                    ? "won"
                    : "lost";

              acc[term][color]++;
              acc[term].total++;
              acc.all.total++;
              acc.all[color]++;

              return { ...acc };
            },
            {
              won: {
                asWhite: 0,
                asBlack: 0,
                total: 0,
              },
              lost: {
                asWhite: 0,
                asBlack: 0,
                total: 0,
              },
              drawn: {
                asWhite: 0,
                asBlack: 0,
                total: 0,
              },
              all: {
                asWhite: 0,
                asBlack: 0,
                total: 0,
              },
            },
          );
        }

        return {
          profile: {
            id,
            username: name,
            imageURL: image,
          },
          stats: {
            games: gameStats(),
          },
        };
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
    existing: createTRPCRouter({
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

          return {
            success,
          };
        }),
    }),
    request: createTRPCRouter({
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

          return {
            success,
          };
        }),
    }),
  }),
});
