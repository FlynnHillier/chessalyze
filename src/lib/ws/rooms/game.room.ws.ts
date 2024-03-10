import { UUID } from "~/types/common.types"
import { wsRoomRegistry } from "~/lib/ws/rooms.ws"

export const createGameRoom = ({ room, pids }: {
    room: string,
    pids: [UUID, UUID, ...UUID[]]
}): string => {
    pids.forEach((pid) => {
        wsRoomRegistry.join(pid, room)
    })

    return room
}

export const destroyGameRoom = (room: string) => {
    wsRoomRegistry.destroy(room)
}