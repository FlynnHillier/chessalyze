import { z } from "zod"
import { Square } from "~/types/game.types"

const TILELETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const
const TILENUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const

const TILEIDS = TILELETTERS.reduce<Square[]>((acc, tileLetter) => {
    return [...acc,
    ...TILENUMBERS.map((tileNumber) => {
        return tileLetter + tileNumber
    })
    ] as Square[]
}, [])


//LITERAL REQUIRES ATLEAST 2 ARGUMENTS SO 'a1' and 'a2' are HARDCODED (may cause errors in future if board dimensions are made mutable)
export const zodIsTileValidator = z.union([
    z.literal("a1"),
    z.literal("a2"),
    ...TILEIDS.map(tileID => z.literal(tileID))
])