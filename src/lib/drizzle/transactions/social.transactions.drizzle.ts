import { eq, or, and } from "drizzle-orm";
import { db } from "~/lib/drizzle/db";
import { friends } from "~/lib/drizzle/social.schema";
import { DatabaseErrorCode } from "~/lib/drizzle/errors/errors.pg";
import { log } from "~/lib/logging/logger.winston";
import { DatabaseError } from "pg";
import {
  TransactionResult,
  TransactionErrorResult,
} from "~/lib/drizzle/transactions/transactions";

//TODO: add return details for if friend cancel / accept / reject fails because the friend request could not be located

/**
 * String provided in pg errors regarding constraint errors on the 'friends' table
 */
enum FRIEND_CONSTRAINT_CODES {
  USER2_FK = "friends_user2_user_id_fk",
  USER1_FK = "friends_user1_user_id_fk",
  USER1_USER2_PK = "friends_user1_user2_pk",
}

class SocialTransactionResult extends TransactionResult<
  | "FriendNotExists"
  | "FriendRequestExists"
  | "FriendRequestNotExists"
  | "UserNotExists"
  | "FriendshipRelationExists"
> {}

class FriendNotExistsError extends TransactionErrorResult<SocialTransactionResult> {
  constructor() {
    super("isFriendNotExists");
  }
}

class FriendRequestExistsError extends TransactionErrorResult<SocialTransactionResult> {
  constructor() {
    super("isFriendRequestExists");
  }
}

class FriendRequestNotExistsError extends TransactionErrorResult<SocialTransactionResult> {
  constructor() {
    super("isFriendRequestNotExists");
  }
}

class UserNotExistError extends TransactionErrorResult<SocialTransactionResult> {
  constructor() {
    super("isUserNotExists");
  }

  static isErrorCause(e: DatabaseError): boolean {
    return (
      e.code === DatabaseErrorCode.ForeignKeyViolation &&
      (e.constraint === FRIEND_CONSTRAINT_CODES.USER1_FK ||
        e.constraint === FRIEND_CONSTRAINT_CODES.USER2_FK)
    );
  }
}

class FriendshipRelationExistsError extends TransactionErrorResult<SocialTransactionResult> {
  constructor() {
    super("isFriendshipRelationExists");
  }
}

/**
 * Format given user id's into correct order for constitency within database.
 */
export function convertToDBSocialUserFormat(
  userID: string,
  anotherUserID: string,
) {
  const [user1_ID, user2_ID] = [userID, anotherUserID].sort();

  return { user1_ID, user2_ID };
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

  private convertToDBSocialUserFormat(targetUser: string) {
    const [user1_ID, user2_ID] = [this.userID, targetUser].sort();

    return { user1_ID, user2_ID };
  }

  /**
   *
   * @param targetID  the ID of the user to receive the friend request
   * @returns true if successful, false if not
   */
  async sendUserFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
      const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
        targetID,
        this.userID,
      );

      const r = await db
        .insert(friends)
        .values({
          user1_ID: user1_ID,
          user2_ID: user2_ID,
          status: "pending",
          pending_accept: targetID,
        })
        .onConflictDoNothing()
        .returning({
          status: friends.status,
        });

      if (r.length === 0) {
        log("social").debug(
          `user '${this.userID}' tried to send friend request to user '${targetID}', but a friendship relation already existed.`,
        );
        return new FriendshipRelationExistsError();
      }

      log("social").debug(
        `user '${this.userID}' successfully sent friend request to user '${targetID}'.`,
      );
      return new SocialTransactionResult(true);
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (UserNotExistError.isErrorCause(e)) {
          log("social").debug(
            `user '${this.userID}' tried to send friend request to user '${targetID}', but the user did not exist.`,
            e,
          );
          return new UserNotExistError();
        }
      }

      log("social").error(
        `failed sending friend request from user '${this.userID}' to user '${targetID}'.`,
        e,
      );
      return new SocialTransactionResult(false);
    }
  }

  /**
   * @param targetID the ID of the user to remove as a friend
   * @returns true if successful, false if not
   */
  async removeConfirmedFriend(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
      targetID,
      this.userID,
    );

    try {
      const r = await db
        .delete(friends)
        .where(
          and(
            eq(friends.status, "confirmed"),
            eq(friends.user1_ID, user1_ID),
            eq(friends.user2_ID, user2_ID),
          ),
        )
        .returning();

      if (r.length === 0) {
        log("social").debug(
          `user '${this.userID}' tried to remove user '${targetID}' as a friend, but they were not friends.`,
        );
        return new FriendNotExistsError();
      }

      log("social").debug(
        `user '${this.userID}' successfully removed user '${targetID}' as a friend.`,
      );
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (UserNotExistError.isErrorCause(e)) {
          log("social").warn(
            `user '${this.userID}' tried to remove user '${targetID}' as a friend, but the user did not exist.`,
            e,
          );
          return new UserNotExistError();
        }
      }

      log("social").error(
        `failed attempting to remove user '${targetID}' from user '${this.userID}'s friend list.`,
        e,
      );

      new SocialTransactionResult(false);
    }

    return new SocialTransactionResult(true);
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
      const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
        targetID,
        this.userID,
      );

      const r = await db
        .delete(friends)
        .where(
          and(
            eq(friends.status, "pending"),
            eq(friends.user1_ID, user1_ID),
            eq(friends.user2_ID, user2_ID),
            eq(friends.pending_accept, targetID),
          ),
        )
        .returning();

      if (r.length === 0) {
        log("social").debug(
          `user '${this.userID}' tried to cancel outgoing friend request to user '${targetID}', but no such request existed.`,
        );
        return new FriendRequestNotExistsError();
      }

      log("social").debug(
        `user '${this.userID}' successfully cancelled outgoing friend request to user '${targetID}'.`,
      );
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (UserNotExistError.isErrorCause(e)) {
          log("social").debug(
            `user '${this.userID}' tried to cancel outgoing friend request to user '${targetID}', but the user did not exist.`,
            e,
          );
          return new UserNotExistError();
        }
      }

      log("social").debug(
        `failed to cancel user '${this.userID}'s outgoing friend request to user '${targetID}'.`,
      );
      new SocialTransactionResult(false);
    }

    return new SocialTransactionResult(true);
  }

  /**
   *
   * @param targetID the ID of the user that sent the initial friend request
   * @returns true if successful, false if not
   */
  async acceptIncomingFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
      const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
        targetID,
        this.userID,
      );

      const r = await db
        .update(friends)
        .set({ status: "confirmed", pending_accept: null })
        .where(
          and(
            eq(friends.status, "pending"),
            eq(friends.pending_accept, this.userID),
            eq(friends.user1_ID, user1_ID),
            eq(friends.user2_ID, user2_ID),
          ),
        )
        .returning();

      if (r.length === 0) {
        log("social").debug(
          `user '${this.userID}' tried to accept friend request from user '${targetID}', but no such friend request existed.`,
        );
        return new FriendRequestNotExistsError();
      }

      log("social").debug(
        `user '${this.userID}' successfully accepted friend request from user '${targetID}'.`,
      );
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (UserNotExistError.isErrorCause(e)) {
          log("social").debug(
            `user '${this.userID}' tried to accept friend request from user '${targetID}', but the user did not exist.`,
            e,
          );
          return new UserNotExistError();
        }
      }

      log("social").error(
        `user '${this.userID}' failed to accept friend request from user '${targetID}'.`,
        e,
      );

      return new SocialTransactionResult(false);
    }

    return new SocialTransactionResult(true);
  }

  /**
   *
   * @param targetID the ID of the user to delete/reject the current incoming request from
   * @returns true if successful, false if not
   */
  async rejectIncomingFriendRequest(
    targetID: string,
  ): Promise<SocialTransactionResult> {
    try {
      const { user1_ID, user2_ID } = convertToDBSocialUserFormat(
        targetID,
        this.userID,
      );

      const r = await db
        .delete(friends)
        .where(
          and(
            eq(friends.status, "pending"),
            eq(friends.user1_ID, user1_ID),
            eq(friends.user2_ID, user2_ID),
            eq(friends.pending_accept, this.userID),
          ),
        )
        .returning();

      if (r.length === 0) {
        log("social").debug(
          `user '${this.userID}' tried to reject incoming friend request from user '${targetID}', but no such friend request exists.`,
        );

        return new FriendRequestNotExistsError();
      }

      log("social").debug(
        `user '${this.userID}' successfully rejected incoming friend request from user '${targetID}'.`,
      );
      return new SocialTransactionResult(true);
    } catch (e) {
      if (e instanceof DatabaseError) {
        if (UserNotExistError.isErrorCause(e)) {
          log("social").warn(
            `user '${this.userID}' tried to reject incoming friend request from user '${targetID}', but the user did not exist.`,
            e,
          );
          return new UserNotExistError();
        }
      }

      log("social").debug(
        `failed to reject user '${this.userID}'s incoming friend request from user '${targetID}'.`,
      );
      return new SocialTransactionResult(false);
    }
  }
}
