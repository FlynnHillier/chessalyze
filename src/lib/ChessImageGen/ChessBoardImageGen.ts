import * as PImage from "pureimage";
import fs from "fs";
import { Chess, Square } from "chess.js";
import { applyDefaultConfig, Config } from "~/lib/ChessImageGen/config";
import path from "path";
import { fileURLToPath } from "url";

export class ChessImageGenerator {
  /**
   * Generate and save png image from FEN
   *
   * @param FEN target position
   * @param out path to save image at
   * @returns path where image is saved
   */
  public static async fromFEN(FEN: string, out: string): Promise<string> {
    const chess: Chess = new Chess(FEN);
    const img = await this.generatePImage(chess);
    return await this.saveAsPNG(img, out);
  }

  private static async saveAsPNG(
    bitmap: PImage.Bitmap,
    path: string,
  ): Promise<string> {
    await PImage.encodePNGToStream(bitmap, fs.createWriteStream(path));
    return path;
  }

  private static async generatePImage(
    chess: Chess,
    config: Partial<Config> = {},
  ) {
    const _config = applyDefaultConfig(config);

    const img = PImage.make(_config.size, _config.size);
    const ctx = img.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, _config.size, _config.size);
    ctx.fillStyle = _config.light;
    ctx.fill();

    const col =
      _config.view === "w" ? (r: number) => r + 1 : (r: number) => 7 - r + 1;
    const row = (c: number) => "abcdefgh"[_config.view === "w" ? c : 7 - c];
    const tile: (r: number, c: number) => Square = (r, c) =>
      (row(r) + col(c)) as Square;

    //draw chessboard canvas
    for (let c = 0; c < 8; c++) {
      for (let r = 0; r < 8; r++) {
        if ((c + r) % 2 === 0) {
          // Tile is dark tile
          ctx.beginPath();
          ctx.rect(
            (_config.size / 8) * (7 - r + 1) - _config.size / 8,
            (_config.size / 8) * c,
            _config.size / 8,
            _config.size / 8,
          );
          ctx.fillStyle = _config.dark;
          ctx.fill();
        }

        const piece = chess.get(tile(r, c));

        if (piece) {
          //Tile contains piece
          const imagePath = `images/${_config.pieceStyle}/${piece.color}/${piece.type}.png`;
          const dir = path.dirname(fileURLToPath(import.meta.url));
          const image = await PImage.decodePNGFromStream(
            fs.createReadStream(path.join(dir, imagePath)),
          );

          ctx.drawImage(
            image,
            (_config.size / 8) * (7 - r + 1) - _config.size / 8,
            (_config.size / 8) * c,
            _config.size / 8,
            _config.size / 8,
          );
        }
      }
    }
    return img;
  }
}
