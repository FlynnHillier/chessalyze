import { and, eq, or } from "drizzle-orm";
import { db } from "~/lib/drizzle/db";
import { friends } from "~/lib/drizzle/social.schema";
import { users } from "~/lib/drizzle/auth.schema";

import { log } from "~/lib/logging/logger.winston";

type DBUser = typeof users.$inferSelect;

/**
 *
 * @param userID target user
 * @returns users which are confirmed friends of the user specified
 */
export async function getUserConfirmedFriends(
  userID: string,
): Promise<DBUser[]> {
  const r = await db.query.friends.findMany({
    where: and(
      or(eq(friends.user1_ID, userID), eq(friends.user2_ID, userID)),
      eq(friends.status, "confirmed"),
    ),
    with: {
      user1: true,
      user2: true,
    },
  });

  return r.map(({ user1, user2 }) => (user1.id === userID ? user2 : user1));
}

/**
 *
 * @param userID target user
 * @returns users which are confirmed friends of the user specified
 */
export async function getFriendRelation(userID: string, anotherUserID: string) {
  const r = db.query.friends.findFirst({
    where: or(
      and(eq(friends.user1_ID, userID), eq(friends.user2_ID, anotherUserID)),
      and(eq(friends.user2_ID, userID), eq(friends.user1_ID, anotherUserID)),
    ),
  });

  return r;
}

/**
 *
 * @param userID target user
 * @returns users which the target user has sent friend requests to
 */
export async function getUserOutgoingFriendRequests(
  userID: string,
): Promise<DBUser[]> {
  const r = await db.query.friends.findMany({
    where: and(eq(friends.user1_ID, userID), eq(friends.status, "pending")),
    with: {
      user2: true,
    },
  });

  return r.map(({ user2 }) => user2);
}

/**
 *
 * @param userID target user
 * @returns users which the target user has received friend requests from
 */
export async function getUserIncomingFriendRequests(
  userID: string,
): Promise<DBUser[]> {
  const r = await db.query.friends.findMany({
    where: eq(friends.pending_accept, userID),
    with: {
      user1: true,
      user2: true,
    },
  });

  return r.map(({ user1, user2 }) => (user1.id === userID ? user2 : user1));
}

/**
 *
 * @param userID
 * @returns expansive information about the target users friends details
 */
export async function getUserGeneralFriendInfo(userID: string): Promise<{
  confirmed: DBUser[];
  pending: {
    outgoing: DBUser[];
    incoming: DBUser[];
  };
}> {
  const r = await db.query.friends.findMany({
    where: or(eq(friends.user1_ID, userID), eq(friends.user2_ID, userID)),
    with: {
      user1: true,
      user2: true,
    },
  });

  const incoming: DBUser[] = [];
  const outgoing: DBUser[] = [];
  const confirmed: DBUser[] = [];

  r.forEach(({ status, user1, user2 }) => {
    const foreign = user1.id === userID ? user2 : user1;

    if (status === "confirmed") confirmed.push(foreign);
    else if (status === "pending" && foreign === user1) incoming.push(foreign);
    else if (status === "pending" && foreign === user2) outgoing.push(foreign);
  });

  return {
    confirmed,
    pending: {
      incoming,
      outgoing,
    },
  };
}

export async function getUserProfile(userID: string) {
  try {
    const r = await db.query.users.findFirst({
      where: eq(users.id, userID),
      with: {
        games_w: {
          with: {
            conclusion: true,
          },
        },
        friends_user1: true,
        friends_user2: true,
        games_b: {
          with: {
            conclusion: true,
          },
        },
      },
    });
    return r;
  } catch (e) {
    log("social").error(
      `errored while fetching user profile for user '${userID}'`,
      e,
    );
    return undefined;
  }
}
