import { UUID } from "@common/src/types/misc"
import {EventEmitter} from "stream"

class WSEmitterRegistry {
    private emitters : Map<UUID,EventEmitter> = new Map()


    public get(id:UUID) : EventEmitter
    {
        console.log("a")
        if (!this.emitters.has(id))
        {
            this.emitters.set(id,new EventEmitter())
        }
        
        console.log("b")
        return this.emitters.get(id) as EventEmitter
    }

    public all() : EventEmitter[]
    {
        return Array.from(this.emitters.values())
    }
}

export const wsEmitterRegistry = new WSEmitterRegistry()