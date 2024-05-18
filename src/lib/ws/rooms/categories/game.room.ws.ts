import { SocketRoomCategory } from "~/lib/ws/rooms.ws";

const gameSocketRoomCategory = new SocketRoomCategory(
  "game",
  ({ id }: { id: string }) => {
    return id;
  },
);

/**
 * @param id game id
 */
export const getGameSocketRoom = gameSocketRoomCategory.get.bind(
  gameSocketRoomCategory,
);

/**
 * @param id game id
 */
export const getOrCreateGameSocketRoom =
  gameSocketRoomCategory.getOrCreate.bind(gameSocketRoomCategory);
