import { UUID } from "./../../../common/dist/index";

export type FEN = String

export interface GameLobby {
    player:{
        id:UUID,
        displayName:string
    }
    id:UUID
}