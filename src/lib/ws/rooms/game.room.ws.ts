import { UUID } from "~/types/common.types";
import { Room, wsRoomRegistry } from "~/lib/ws/rooms.ws";

/**
 * Create new game room populated with specified users
 */
export const createGameRoom = ({
  room,
  uids,
}: {
  room: string;
  uids: [UUID, UUID, ...UUID[]];
}): Room => {
  const r = wsRoomRegistry.getOrCreate(room);

  r.join(...uids);

  return r;
};
