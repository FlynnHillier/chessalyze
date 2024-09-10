import { getUserConfirmedFriends } from "~/lib/drizzle/queries/social.queries.drizzle";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import WebSocket from "ws";

/**
 *
 * @param userID ID of the user to fetch friends sockets
 */
export async function getUserFriendsSockets(userID: string) {
  const friends = await getUserConfirmedFriends(userID);

  const allFriendsSockets = friends
    .map(({ id }) => id)
    .reduce((sockets, playerID) => {
      return [...sockets, ...wsSocketRegistry.get(playerID)];
    }, [] as WebSocket[]);

  return allFriendsSockets;
}
