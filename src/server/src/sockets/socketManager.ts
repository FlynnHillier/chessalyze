import { UUID } from "chessalyze-common";
import { Socket } from "socket.io";

export class SocketManager {
    public socketMap: Map<UUID,{rooms:string[],sockets:Socket[]}> = new Map()
    
    constructor(){}
    
    join(playerUUID:UUID,room:string) : void {
        const existingMapEntry = this.socketMap.get((playerUUID))

        this.socketMap.set(playerUUID, //update socket map entry
            {
                sockets:[],
                ...existingMapEntry,
                rooms:[
                    room,
                    ...(existingMapEntry?.rooms || [])
                ]
            })

        for(let socket of existingMapEntry?.sockets || []){ //update all socket connections to be within room
            socket.join(room)
        }
    }

    leave(playerUUID:UUID,room:string) : void {
        const existingMapEntry = this.socketMap.get((playerUUID))

        this.socketMap.set(playerUUID, //update socket map entry
            {
                sockets:[],
                ...existingMapEntry,
                rooms:existingMapEntry?.rooms.splice(existingMapEntry.rooms.indexOf(room),1) || []
            })

        for(let socket of existingMapEntry?.sockets || []){ //update all socket connections to leave room
            socket.leave(room)
        }
    }


    registerConnection(playerUUID:UUID,socket:Socket) : void{
        const existingMapEntry = this.socketMap.get((playerUUID))

        this.socketMap.set(playerUUID,
            {
                rooms:[],
                ...existingMapEntry,
                sockets:[
                    socket,
                    ...(existingMapEntry?.sockets || [])
                ]
            })

        for(let room of existingMapEntry?.rooms || []){
            socket.join(room)
        }
    }
}