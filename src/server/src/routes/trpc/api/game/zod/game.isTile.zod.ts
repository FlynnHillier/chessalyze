import { z } from "zod"

const TILELETTERS = ["a","b","c","d","e","f","g","h"] as const
const TILENUMBERS = ["1","2","3","4","5","6","7","8"] as const
type Tile = `${typeof TILELETTERS[number]}${typeof TILENUMBERS[number]}`

const TILEIDS = TILELETTERS.reduce<Tile[]>((acc,tileLetter)=>{
    return [...acc,
        ...TILENUMBERS.map((tileNumber)=>{
            return tileLetter + tileNumber
        })
    ] as Tile[]
},[])


//LITERAL REQUIRES ATLEAST 2 ARGUMENTS SO 'a1' and 'a2' are HARDCODED (may cause errors in future if board dimensions are made mutable)
export const zodIsTileValidator = z.union([
    z.literal("a1"),
    z.literal("a2"),
    ...TILEIDS.map(tileID => z.literal(tileID))
])