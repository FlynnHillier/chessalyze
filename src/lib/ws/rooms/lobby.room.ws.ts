import { SocketRoomCategory } from "~/lib/ws/rooms.ws";

const lobbySocketRoomCategory = new SocketRoomCategory(
  "lobby",
  ({ id }: { id: string }) => {
    return id;
  },
);

/**
 * @param id lobby id
 */
export const getLobbySocketRoom = lobbySocketRoomCategory.get.bind(
  lobbySocketRoomCategory,
);

/**
 * @param id lobby id
 */
export const getOrCreateLobbySocketRoom =
  lobbySocketRoomCategory.getOrCreate.bind(lobbySocketRoomCategory);
