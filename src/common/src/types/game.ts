import { UUID } from "./misc";

export type FEN = string

export type GameTermination = "checkmate" | "3-fold repition" | "50 move rule" | "insufficient material" | "stalemate" | "resignation" | "timeout" | "timeout vs insufficient material"

export type PromotionSymbol = "r" | "b" | "n" | "q"

interface Player {
    displayName:string,
    id:UUID
}

export interface GameSummary {
    id:UUID,
    players:{
        w:Player,
        b:Player
    }
    conclusion: GameConclusion,
    moves:string[]
    time:{
        start:number,
        end:number,
        duration:number,
    }
}

export interface ClientGameConclusion {
    victor:null | "w" | "b",
    termination: GameTermination,
    timeSnapshot?:{
        w:number,
        b:number
    }
}

export interface GameConclusion {
    termination:GameTermination,
    victor:null | "w" | "b",
    boardState:FEN
} 

export interface GameLobby {
    player:Player
    id:UUID
}