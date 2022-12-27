import { UUID } from "./misc";

export type FEN = string

export type GameTermination = "checkmate" | "3-fold repition" | "50 move rule" | "insufficient material" | "stalemate" | "resignation" | "timeout"

export type PromotionSymbol = "r" | "b" | "n" | "q"

export interface GameSummary {
    players:{
        w:UUID,
        b:UUID
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
    playerID:UUID
    id:UUID
}