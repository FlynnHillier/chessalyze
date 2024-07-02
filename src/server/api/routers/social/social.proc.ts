import z from "zod";
import { TRPCError } from "@trpc/server";

import { SOCIALPROCEDURE } from "~/server/api/routers/social/social.trpc";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import DrizzleSocialTransaction from "~/lib/drizzle/transactions/social.transactions.drizzle";
import { getUserProfile } from "~/lib/drizzle/queries/social.queries.drizzle";

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

class FriendRequestExistsError extends TRPCError {
  constructor() {
    super({ code: "CONFLICT", message: "friend request already exists" });
  }
}

class FriendRequestNotExistsError extends TRPCError {
  constructor() {
    super({ code: "CONFLICT", message: "friend request does not exist" });
  }
}

export const trpcSocialRouter = createTRPCRouter({
  profile: createTRPCRouter({
    user: publicProcedure
      .input(z.object({ targetUserID: z.string() }))
      .query(async ({ input, ctx }) => {
        const fullUserProfile = await getUserProfile(input.targetUserID);

        if (!fullUserProfile) throw new UserNotExistError(input.targetUserID);

        // if (
        //   fullUserProfile.friends.some(
        //     ({ status, user1_ID, user2_ID }) =>
        //       status === "confirmed" &&
        //       (user1_ID === ctx.user.id || user2_ID === ctx.user.id),
        //   )
        // ) {
        //   //are friends (Requries protected procedure)
        // }

        const { id, email, games_b, games_w, image, name } = fullUserProfile;

        const allGames = [...games_b, ...games_w];

        // stats regarding the games the user has played
        const gStats = allGames.reduce(
          (acc, game) => {
            if (game.p_black_id === input.targetUserID) {
              // Player is black
              if (game.conclusion.termination_type === "draw")
                acc.black.drawn++;
              else
                game.conclusion.termination_type === "b"
                  ? acc.black.won++
                  : acc.black.lost++;
            } else if (game.p_white_id === input.targetUserID) {
              // Player is white
              if (game.conclusion.termination_type === "draw")
                acc.white.drawn++;
              else
                game.conclusion.termination_type === "w"
                  ? acc.white.won++
                  : acc.white.lost++;
            }

            return { ...acc };
          },
          {
            white: {
              won: 0,
              lost: 0,
              drawn: 0,
            },
            black: {
              won: 0,
              lost: 0,
              drawn: 0,
            },
          },
        );

        return {
          profile: {
            id,
            username: name,
            imageURL: image,
          },
          stats: {
            games: {
              won: {
                asWhite: gStats.white.won,
                asBlack: gStats.black.won,
                total: gStats.white.won + gStats.black.won,
              },
              lost: {
                asWhite: gStats.white.lost,
                asBlack: gStats.black.lost,
                total: gStats.black.lost + gStats.white.lost,
              },
              drawn: {
                asWhite: gStats.white.drawn,
                asBlack: gStats.black.drawn,
                total: gStats.black.drawn + gStats.white.drawn,
              },
            },
          },
        };
      }),
  }),

  friend: createTRPCRouter({
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
      accept: protectedProcedure
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
