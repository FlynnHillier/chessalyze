import w_bishop from "./w_bishop.png"
import w_king from "./w_king.png"
import w_knight from "./w_knight.png"
import w_queen from "./w_queen.png"
import w_rook from "./w_rook.png"

import b_bishop from "./b_bishop.png"
import b_king from "./b_king.png"
import b_knight from "./b_knight.png"
import b_queen from "./b_queen.png"
import b_rook from "./b_rook.png"


export interface PieceImages {
    "b":string,
    "k":string,
    "n":string,
    "q":string,
    "r":string
}

export const whitePieceImages : PieceImages = {
    "b":w_bishop,
    "k":w_king,
    "n":w_knight,
    "q":w_queen,
    "r":w_rook
}

export const blackPieceImages : PieceImages = {
    "b":b_bishop,
    "k":b_king,
    "n":b_knight,
    "q":b_queen,
    "r":b_rook
}

export const pieceImages : {"w": PieceImages,"b": PieceImages}= {
    "w":whitePieceImages,
    "b":blackPieceImages
}

export default pieceImages