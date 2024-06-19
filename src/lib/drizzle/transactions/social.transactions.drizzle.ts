import { eq, or, and, DrizzleError } from "drizzle-orm";
import { db } from "~/lib/drizzle/db";
import { friends } from "~/lib/drizzle/social.schema";

import { log } from "~/lib/logging/logger.winston";

export default class DrizzleSocialTransaction {
  /**
   *
   * @param userID the user initiating the transaction
   */
  constructor(private userID: string) {}

  /**
   *
   * @param targetID  the ID of the user to receive the friend request
   */
  async sendUserFriendRequest(targetID: string): Promise<boolean> {
    try {
      await db
        .insert(friends)
        .values({
          user1_ID: this.userID,
          user2_ID: targetID,
          status: "pending",
        })
        .onConflictDoNothing({ target: [friends.user1_ID, friends.user2_ID] });

      log("social").debug(
        `user ${this.userID} sent friend request to user ${targetID}`,
      );
    } catch (e) {
      log("social").error(
        `user '${this.userID}' failed to send friend request to user '${targetID}'`,
        e,
      );
      return false;
    }

    return true;
  }

  /**
   *
   * @param targetID the ID of the user that sent the initial friend request
   */
  async acceptUserFriendRequest(targetID: string) {
    try {
      await db
        .update(friends)
        .set({ status: "confirmed" })
        .where(
          and(
            eq(friends.status, "pending"),
            and(
              eq(friends.user1_ID, targetID),
              eq(friends.user2_ID, this.userID),
            ),
          ),
        );

      log("social").debug(
        `user '${this.userID}' accepted friend request from user '${targetID}'`,
      );
    } catch (e) {
      log("social").error(
        `user '${this.userID}' failed to accept friend request from user '${targetID}' %o`,
        e,
      );
    }
  }

  /**
   * @param targetID the ID of the user to remove as a friend
   */
  async removeConfirmedFriend(targetID: string): Promise<boolean> {
    await db
      .delete(friends)
      .where(
        and(
          eq(friends.status, "confirmed"),
          or(
            and(
              eq(friends.user1_ID, this.userID),
              eq(friends.user2_ID, targetID),
            ),
            and(
              eq(friends.user2_ID, this.userID),
              eq(friends.user1_ID, targetID),
            ),
          ),
        ),
      );

    return true;
  }

  /**
   *
   * @param targetID the ID of the user to cancel the existing outgoing request to
   */
  async cancelOutgoingFriendRequest(targetID: string): Promise<boolean> {
    await db
      .delete(friends)
      .where(
        and(
          eq(friends.status, "pending"),
          and(
            eq(friends.user1_ID, this.userID),
            eq(friends.user2_ID, targetID),
          ),
        ),
      );

    return true;
  }

  /**
   *
   * @param targetID the ID of the user to delete/reject the current incoming request from
   */
  async cancelIncomingFriendRequest(targetID: string): Promise<boolean> {
    await db
      .delete(friends)
      .where(
        and(
          eq(friends.status, "pending"),
          and(eq(friends.user1_ID, targetID), eq(friends.user2_ID, targetID)),
        ),
      );

    return true;
  }
}
