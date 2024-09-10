import { eq, type InferSelectModel } from "drizzle-orm";

import { db } from "~/lib/drizzle/db";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/lib/drizzle/auth.schema";
import { conclusions, games } from "~/lib/drizzle/games.schema";
import { ActivityManager } from "~/lib/social/activity.social";
import { convertToDBSocialUserFormat } from "~/lib/drizzle/transactions/social.transactions.drizzle";
import { friends } from "~/lib/drizzle/social.schema";
import { log } from "~/lib/logging/logger.winston";
import { z } from "zod";

function retrieveActivityStatus({ userID }: { userID: string }) {
  return ActivityManager.getActivity(userID).getSocialActivity();
}

function retrieveGameStats({
  dbGames,
  userID,
}: {
  dbGames: (InferSelectModel<typeof games> & {
    conclusion: InferSelectModel<typeof conclusions>;
  })[];
  userID: string;
}) {
  return dbGames.reduce(
    (acc, game) => {
      const color = game.p_black_id === userID ? "asBlack" : "asWhite";

      const term =
        game.conclusion.victor_pid === null
          ? "drawn"
          : game.conclusion.victor_pid === userID
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

function retrieveFriendRelation(
  dbFriendRelations: {
    asUser2: (typeof friends.$inferSelect)[];
    asUser1: (typeof friends.$inferSelect)[];
  },
  {
    initiatingUserID,
    targetUserID,
  }: { initiatingUserID?: string; targetUserID: string },
) {
  if (!initiatingUserID) return undefined;

  const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
    initiatingUserID,
    targetUserID,
  );

  const row =
    user1_ID === initiatingUserID
      ? dbFriendRelations.asUser1.find(
          (relation) => relation.user1_ID === initiatingUserID,
        )
      : dbFriendRelations.asUser2.find(
          (relation) => relation.user2_ID === initiatingUserID,
        );

  if (row === undefined) return "none";

  if (row.status === "confirmed") return "confirmed";

  if (row.status === "pending" && row.pending_accept === initiatingUserID)
    return "requestIncoming";
  if (row.status === "pending" && row.pending_accept === targetUserID)
    return "requestOutgoing";

  log("social").warn(
    `while attempting receive friend relation between user '${initiatingUserID}' & '${targetUserID}', the relation could not be properly determined`,
  );
  return undefined;
}

async function fetchProfileData(userID: string, originatingUserID?: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userID),
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

  if (!result)
    return {
      profile: undefined,
    };

  const { id, games_b, games_w, image, name, friends_user1, friends_user2 } =
    result;

  return {
    profile: {
      user: {
        id,
        username: name,
        imageURL: image,
      },
      stats: {
        games: retrieveGameStats({
          dbGames: [...games_b, ...games_w],
          userID: userID,
        }),
      },
      friend: originatingUserID
        ? {
            relation: retrieveFriendRelation(
              { asUser1: friends_user1, asUser2: friends_user2 },
              { targetUserID: userID, initiatingUserID: originatingUserID },
            ) as ReturnType<typeof retrieveFriendRelation>,
          }
        : undefined,
      activity: retrieveActivityStatus({ userID: userID }),
    },
  };
}

export const trpcSocialProfileProcedure = createTRPCRouter({
  target: publicProcedure
    .input(z.object({ targetUserID: z.string() }))
    .query(async ({ input, ctx }) => {
      return await fetchProfileData(input.targetUserID, ctx.user?.id);
    }),
  self: protectedProcedure.query(async ({ ctx }) => {
    return await fetchProfileData(ctx.user.id);
  }),
});
