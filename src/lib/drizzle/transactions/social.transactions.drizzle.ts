import { db } from "~/lib/drizzle/db";
import { friends } from "~/lib/drizzle/social.schema";

//TODO: add logging on failure
export async function sendUserFriendRequest(
  senderID: string,
  recipientID: string,
): Promise<boolean> {
  if (senderID === recipientID) return false;

  await db
    .insert(friends)
    .values({ user1_ID: senderID, user2_ID: recipientID, status: "pending" })
    .onConflictDoNothing({ target: [friends.user1_ID, friends.user2_ID] });

  return true;
}
