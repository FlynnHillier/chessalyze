import { eq, or, and } from "drizzle-orm";
import { db } from "~/lib/drizzle/db";
import { friends } from "~/lib/drizzle/social.schema";
import { DatabaseErrorCode } from "~/lib/drizzle/errors/errors.pg";
import { log } from "~/lib/logging/logger.winston";
import { DatabaseError } from "pg";

/**
 * String provided in pg errors regarding constraint errors on the 'friends' table
 */
enum FRIEND_CONSTRAINT_CODES {
  USER2_FK = "friends_user2_user_id_fk",
  USER1_FK = "friends_user1_user_id_fk",
}

/**
 * To Describe the result of a database transaction
 */
type TransactionResult<T extends any = undefined> = {
  success: boolean;
  message?: string;
  meta?: T;
};

type SocialTransactionResult = TransactionResult<{
  isNonExistentTargetUserError: boolean;
}>;

/**
 *
 * @param userID the target user ID
 * @returns suitable object, for when target user did not exist
 */
const nonExistentUserError: (userID: string) => TransactionResult<{
  isNonExistentTargetUserError: true;
}> = (userID: string) => {
  return {
    success: false,
    message: `user '${userID}' does not exist`,
    meta: {
      isNonExistentTargetUserError: true,
    },
  };
};

/**
 *
 * @param e an error
 * @returns true if the error is caused because user2 did not exist
 */
function isErrorBecauseUser2DidNotExist(e: unknown): boolean {
  return (
    e instanceof DatabaseError &&
    e.code === DatabaseErrorCode.ForeignKeyViolation &&
    e.constraint === FRIEND_CONSTRAINT_CODES.USER2_FK
  );
}

/**
 *
 * @param e an error
 * @returns true if the error is caused because user1 did not exist
 */
function isErrorBecauseUser1DidNotExist(e: unknown): boolean {
  return (
    e instanceof DatabaseError &&
    e.code === DatabaseErrorCode.ForeignKeyViolation &&
    e.constraint === FRIEND_CONSTRAINT_CODES.USER2_FK
  );
}

/**
 * Carry out database transactions regarding tables in the 'social context'
 */
export default class DrizzleSocialTransaction {
  /**
   *
   * @param userID the user initiating the transaction
   */
  constructor(private userID: string) {}

  /**
   *
   * @param targetID  the ID of the user to receive the friend request
   * @returns true if successful, false if not
   */
  async sendUserFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
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
        `user '${this.userID}' sent friend request to user '${targetID}'.`,
      );
    } catch (e) {
      if (isErrorBecauseUser2DidNotExist(e)) {
        log("social").warn(
          `user '${this.userID}' tried to send friend request to user '${targetID}', but the user did not exist.`,
          e,
        );

        return nonExistentUserError(targetID);
      }

      log("social").error(
        `failed sending friend request from user '${this.userID}' to user '${targetID}'.`,
        e,
      );
      return {
        success: false,
      };
    }

    return { success: true };
  }

  /**
   *
   * @param targetID the ID of the user that sent the initial friend request
   * @returns true if successful, false if not
   */
  async acceptUserFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
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
        `user '${this.userID}' accepted friend request from user '${targetID}'.`,
      );
    } catch (e) {
      if (isErrorBecauseUser1DidNotExist(e)) {
        // Target user did not exist in users table
        log("social").warn(
          `user '${this.userID}' tried to accept friend request from user '${targetID}', but the user did not exist.`,
          e,
        );
        return nonExistentUserError(targetID);
      }

      log("social").error(
        `user '${this.userID}' failed to accept friend request from user '${targetID}'.`,
        e,
      );
      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  }

  /**
   * @param targetID the ID of the user to remove as a friend
   * @returns true if successful, false if not
   */
  async removeConfirmedFriend(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
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

      log("social").debug(
        `user '${this.userID}' removed user '${targetID}' as a friend.`,
      );
    } catch (e) {
      if (
        isErrorBecauseUser1DidNotExist(e) ||
        isErrorBecauseUser2DidNotExist(e)
      ) {
        // Target user did not exist in users table
        log("social").warn(
          `user '${this.userID}' tried to remove user '${targetID}' as a friend, but the user did not exist.`,
          e,
        );
        return nonExistentUserError(targetID);
      }
      log("social").error(
        `failed attempting to remove user '${targetID}' from user '${this.userID}'s friend list.`,
        e,
      );

      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  }

  /**
   *
   * @param targetID the ID of the user to cancel the existing outgoing request to
   * @returns true if successful, false if not
   */
  async cancelOutgoingFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
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

      log("social").debug(
        `user '${this.userID}' cancelled outgoing friend request to user '${targetID}'.`,
      );
    } catch (e) {
      if (isErrorBecauseUser2DidNotExist(e)) {
        log("social").warn(
          `user '${this.userID}' tried to cancel outgoing friend request to user '${targetID}', but the user did not exist.`,
          e,
        );
        return nonExistentUserError(targetID);
      }

      log("social").debug(
        `failed to cancel user '${this.userID}'s outgoing friend request to user '${targetID}'.`,
      );
      return {
        success: false,
      };
    }
    return {
      success: true,
    };
  }

  /**
   *
   * @param targetID the ID of the user to delete/reject the current incoming request from
   * @returns true if successful, false if not
   */
  async cancelIncomingFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
      await db
        .delete(friends)
        .where(
          and(
            eq(friends.status, "pending"),
            and(eq(friends.user1_ID, targetID), eq(friends.user2_ID, targetID)),
          ),
        );

      log("social").debug(
        `user '${this.userID}' cancelled incoming friend request from user '${targetID}'.`,
      );
    } catch (e) {
      if (isErrorBecauseUser1DidNotExist(e)) {
        log("social").warn(
          `user '${this.userID}' tried to cancel incoming friend request from user '${targetID}', but the user did not exist.`,
          e,
        );
        return nonExistentUserError(targetID);
      }

      log("social").debug(
        `failed to cancel user '${this.userID}'s incoming friend request from user '${targetID}'.`,
      );
      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  }
}
