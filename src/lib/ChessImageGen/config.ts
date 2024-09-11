import { Color } from "chess.js";

export type Config = {
  size: number; // Size of chessboard (width & height)
  light: string; // Colour of light squared tiles
  dark: string; // Colour of dark squared tiles
  view: Color; // Which way the board is facing
  pieceStyle: "cburnett"; // The style of piece to use
  quality: number; // Quality of generated image (0-1)
};

export const DEFAULTCONFIG: Config = {
  size: 500,
  light: "rgb(240, 217, 181)",
  dark: "rgb(181, 136, 99)",
  view: "w",
  pieceStyle: "cburnett",
  quality: 1,
};

export function applyDefaultConfig(config: Partial<Config>): Config {
  return {
    ...DEFAULTCONFIG,
    ...config,
  };
}
