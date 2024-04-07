import {
  FaRegChessKing,
  FaRegChessQueen,
  FaRegChessRook,
  FaRegChessBishop,
  FaRegChessKnight,
  FaRegChessPawn,
} from "react-icons/fa6";
import {
  FaChessKing,
  FaChessQueen,
  FaChessRook,
  FaChessBishop,
  FaChessKnight,
  FaChessPawn,
} from "react-icons/fa";
import { Color, PieceSymbol } from "chess.js";

export function PieceIcon(piece: PieceSymbol, color: Color): JSX.Element {
  if (color === "w") return WhitePieceIcon(piece);
  if (color === "b") return BlackPieceIcon(piece);
  return <></>;
}

export function BlackPieceIcon(piece: PieceSymbol): JSX.Element {
  switch (piece) {
    case "p":
      return <FaRegChessPawn />;
    case "q":
      return <FaRegChessQueen />;
    case "r":
      return <FaRegChessRook />;
    case "b":
      return <FaRegChessBishop />;
    case "n":
      return <FaRegChessKnight />;
    case "k":
      return <FaRegChessKing />;
  }
}

export function WhitePieceIcon(piece: PieceSymbol): JSX.Element {
  switch (piece) {
    case "p":
      return <FaChessPawn />;
    case "q":
      return <FaChessQueen />;
    case "r":
      return <FaChessRook />;
    case "b":
      return <FaChessBishop />;
    case "n":
      return <FaChessKnight />;
    case "k":
      return <FaChessKing />;
  }
}
