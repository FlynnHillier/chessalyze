import { UUID } from "@common/src/types/misc"

export type FEN = String

export interface GameLobby {
    player:{
        id:UUID,
        displayName:string
    }
    id:UUID
}