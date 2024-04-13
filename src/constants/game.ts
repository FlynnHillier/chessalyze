/**
 * A collection of constants reffering to potential values of various components of the game.
 */

/**
 * Color
 */
export const COLOR = ["w", "b"] as const;

/**
 * Piece symbols
 */
export const PIECE = ["p", "r", "n", "b", "q", "k"] as const;

/**
 * Piece symbols of promotable pieces
 */
export const PROMOTIONPIECE = ["r", "n", "b", "q"] as const;

/**
 * Piece symbols that are capturable
 */
export const CAPTURABLEPIECE = ["r", "b", "n", "q", "p"] as const;

/**
 * Tile Id's e.g a1, h8 etc.
 */
export const TILEIDS = [
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "a8",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b7",
  "b8",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "g1",
  "g2",
  "g3",
  "g4",
  "g5",
  "g6",
  "g7",
  "g8",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "h7",
  "h8",
] as const;

// // AUTO GENERATE TILD IDS GIVEN SPECIFIED TILE LETTERS AND TILE NUMBERS.
// const TILELETTERS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
// const TILENUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
// export const TILEIDS = TILELETTERS.reduce<Square[]>((acc, tileLetter) => {
//   return [
//     ...acc,
//     ...TILENUMBERS.map((tileNumber) => {
//       return tileLetter + tileNumber;
//     }),
//   ] as Square[];
// }, [] as Square[]);
