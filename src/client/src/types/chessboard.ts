export type GameConclusionReason = "insufficient material" | "3-move repitition" | "50-move rule" | "checkmate" | "stalemate"
export type GameConclusionType = "white" | "black" | "draw"

export interface GameConclusion {
    type:GameConclusionType
    reason:GameConclusionReason
}