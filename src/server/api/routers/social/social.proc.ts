import z from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import DrizzleSocialTransaction, {
  convertToDBSocialUserFormat,
} from "~/lib/drizzle/transactions/social.transactions.drizzle";
import { getFriendRelation } from "~/lib/drizzle/queries/social.queries.drizzle";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { db } from "~/lib/drizzle/db";
import { users } from "~/lib/drizzle/auth.schema";
import { eq } from "drizzle-orm";
import { log } from "~/lib/logging/logger.winston";
import { GameMaster } from "~/lib/game/GameMaster";
import { SOCIAL_STATUS } from "~/constants/social";

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
        const dbQueryResult = await db.query.users.findFirst({
          where: eq(users.id, input.targetUserID),
          with: {
            friends_user1: true,
            friends_user2: true,
            games_b: {
              with: {
                conclusion: true,
              },
            },
            games_w: {
              with: {
                conclusion: true,
              },
            },
          },
        });

        if (!dbQueryResult) throw new UserNotExistError(input.targetUserID);

        const {
          id,
          games_b,
          games_w,
          image,
          name,
          friends_user1,
          friends_user2,
        } = dbQueryResult;

        /**
         *
         * get friend relation if request originates from an authed user
         */
        function friendRelation() {
          if (!ctx.user) return undefined;

          const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
            ctx.user.id,
            input.targetUserID,
          );

          const row =
            user1_ID === ctx.user.id
              ? friends_user2.find(
                  (relation) => relation.user1_ID === ctx.user!.id,
                )
              : friends_user1.find(
                  (relation) => relation.user2_ID === ctx.user!.id,
                );

          if (row === undefined) return "none";

          if (row.status === "confirmed") return "confirmed";

          if (row.status === "pending" && row.pending_accept === ctx.user.id)
            return "requestIncoming";
          if (
            row.status === "pending" &&
            row.pending_accept === input.targetUserID
          )
            return "requestOutgoing";

          log("social").warn(
            `while attempting receive friend relation between user '${ctx.user.id}' & '${input.targetUserID}', the relation could not be properly determined`,
          );
          return undefined;
        }

        /**
         * Generate game stats object for profile
         */
        function gameStats() {
          return [...games_b, ...games_w].reduce(
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

        function activity(): {
          status: {
            primary: string;
            secondary?: string;
          };
        } {
          const activeGame = GameMaster.instance().getByPlayer(id);

          if (activeGame) {
            const gameTimeData = activeGame.getTimeData();

            return {
              status: {
                primary: SOCIAL_STATUS.inGame.primary,
                secondary: SOCIAL_STATUS.inGame.secondary({
                  timed: gameTimeData && {
                    preset: gameTimeData.clock?.initial.template,
                  },
                }),
              },
            };
          }

          //TODO: update online / offline
          return {
            status: {
              primary: SOCIAL_STATUS.idle.primary,
              secondary: SOCIAL_STATUS.idle.secondary,
            },
          };
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
          friend: ctx.user
            ? {
                relation: friendRelation() as ReturnType<typeof friendRelation>,
              }
            : undefined,
          activity: activity(),
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
