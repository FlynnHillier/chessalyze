import { UUID } from "./misc";
import { PieceSymbol } from "chess.js"

export type FEN = string

export type GameTermination = "checkmate" | "3-fold repition" | "50 move rule" | "insufficient material" | "stalemate" | "resignation" | "timeout" | "timeout vs insufficient material"

export type PromotionSymbol = "r" | "b" | "n" | "q"

export type CapturableSymbol = "r" | "b" | "n" | "q" | "p"

export type BW<T> = {
    w:T,
    b:T
}

export interface Player {
    displayName:string,
    id:UUID
}


export interface GameSnapshot {
    id:UUID,
    players:BW<Player>,
    FEN:FEN,
    captured:BW<{[key in CapturableSymbol]: number}>
    time:{
        isTimed:boolean,
        remaining:BW<number>
    },
}

export interface GameTerminationEvent {
    termination:GameTermination,
    victor:null | "w" | "b",
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

export interface GameConclusion {
    termination:GameTermination,
    victor:null | "w" | "b",
    boardState:FEN
} 

export interface GameLobby {
    player:Player
    id:UUID
}