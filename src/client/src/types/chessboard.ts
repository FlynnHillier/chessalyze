export type GameConclusionReason = "insufficient material" | "3-move repitition" | "50-move rule" | "checkmate" | "stalemate"
export type GameConclusionType = "w" | "b" | "draw"

export interface GameConclusion {
    type:GameConclusionType
    reason:GameConclusionReason
}