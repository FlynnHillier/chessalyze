import { UUID } from "@common/src/types/misc"
import { EventEmitter } from "stream"
import { wsEmitterRegistry } from "./emitters.ws"
import { EmitType } from "../types/event"
import { EmitEvent } from "./events.ws"

class WSRoomRegistry
{
    private rooms : Map<string, Set<EventEmitter>> = new Map()

    public get(room:string) : EventEmitter[]
    {
        return Array.from(this.rooms.get(room) ?? [])
    }

    public join(emitterID:UUID, room:string) : void
    {   
        if (!this.rooms.has(room))
            this.rooms.set(room, new Set())

        const emitter = wsEmitterRegistry.get(emitterID)
        this.rooms.get(room)!.add(emitter)
    }

    public leave(emitterID:UUID, room:string) : void
    {
        this.rooms.get(room)?.delete(wsEmitterRegistry.get(emitterID))
    }

    public emit<T extends EmitEvent>(room:string, {event, data} : T) : number
    {
        const emitters = Array.from(this.rooms.get(room) ?? [])

        emitters.forEach((emitter)=>{
            emitter.emit(event, data)
        })

        return emitters.length
    }

    public destroy(room:string) : void
    {
        this.rooms.delete(room)
    }

}

export const wsRoomRegistry = new WSRoomRegistry()