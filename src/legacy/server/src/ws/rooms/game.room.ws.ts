import { UUID } from "@common/src/types/misc"
import { wsRoomRegistry } from "../rooms.ws"

export const createGameRoom = ({room, pids} : {
    room:string,
    pids:[UUID,UUID,...UUID[]]
}) : string =>
{
    pids.forEach((pid)=>{
        wsRoomRegistry.join(pid,room)
    })

    return room
}

export const destroyGameRoom = (room:string) => {
    wsRoomRegistry.destroy(room)
}