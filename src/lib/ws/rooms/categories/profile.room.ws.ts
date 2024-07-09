import { SocketRoomCategory } from "~/lib/ws/rooms.ws";

const profileViewSocketRoom = new SocketRoomCategory(
  "profile_view",
  ({ playerID }: { playerID: string }) => playerID,
);

/**
 * @param id lobby id
 */
export const getProfileViewSocketRoom = profileViewSocketRoom.get.bind(
  profileViewSocketRoom,
);

/**
 * @param id lobby id
 */
export const getOrCreateProfileViewSocketRoom =
  profileViewSocketRoom.getOrCreate.bind(profileViewSocketRoom);
