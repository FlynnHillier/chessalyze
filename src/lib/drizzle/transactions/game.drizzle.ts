import { GameSummary } from "~/types/game.types";
import { db } from "~/lib/drizzle/db";
import { games, moves } from "~/lib/drizzle/games.schema";
import { logDev, loggingColourCode } from "~/lib/logging/dev.logger";

/**
 * Store a given game summary into database.
 *
 * @param summary - summary to store in db
 */
export async function saveGameSummary(summary: GameSummary) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(games).values({
        id: summary.id,
        p_black: summary.players.b.pid,
        p_white: summary.players.w.pid,
        t_duration: summary.time.duration,
        t_start: summary.time.start,
        t_end: summary.time.end,
      });

      await tx.insert(moves).values(
        summary.moves.map((move, i) => ({
          gameID: summary.id,
          turn: i,
          fen: move.fen,
          source: move.move.source,
          target: move.move.target,
          promotion: move.move.promotion,
          t_duration: move.time.moveDuration,
          t_w_remaining: move.time.remaining?.w,
          t_b_remaining: move.time.remaining?.b,
        })),
      );
    });
  } catch (e) {
    //TODO: add physical storage logging here.
    logDev({
      message: ["failed to store game in datatbase", e],
      color: loggingColourCode.FgRed,
    });
  }
}
