import path from "path";

/**
 * Paths are resolved from the working directory (the project root when running
 * `next start`), not from this file: the build rewrites import.meta.url to the
 * absolute source path on the build machine, which breaks if the built app moves.
 */
export const PUBLIC_FOLDER_PATH = path.join(process.cwd(), "public");

/** Piece images used to render board PNGs of finished games. */
export const CHESS_IMAGE_ASSETS_PATH = path.join(
  process.cwd(),
  "src/lib/ChessImageGen/images",
);
