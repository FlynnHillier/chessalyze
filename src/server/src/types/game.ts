import { UUID } from "./../../../common/dist/index";

export type FEN = String

export type GameTermination = "checkmate" | "3-fold repition" | "50 move rule" | "insufficient material" | "stalemate" | "resignation" | "timeout"

export interface GameSummary {
    players:{
        w:{
            id:UUID,
            displayName:string,
        },
        b:{
            id:UUID,
            displayName:string,
        }
    }
    conclusion: GameConclusion,
    moves:string[]
    time:{
        start:number,
        end:number,
        duration:number,
    }
}

export interface GameConclusion {
    termination:GameTermination,
    victor:null | "w" | "b",
    boardState:FEN
} 


export interface GameLobby {
    player:{
        id:UUID,
        displayName:string
    }
    id:UUID
}