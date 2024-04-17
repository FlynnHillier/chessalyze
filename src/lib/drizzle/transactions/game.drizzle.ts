import { GameSummary } from "~/types/game.types";
import { db } from "~/lib/drizzle/db";
import { games, moves } from "~/lib/drizzle/games.schema";
import { logDev, loggingColourCode } from "~/lib/logging/dev.logger";

export async function saveGameSummary(summary: GameSummary) {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(games).values({
        id: summary.id,
        p_black: summary.players.b.pid,
        p_white: summary.players.w.pid,
      });

      await tx.insert(moves).values(
        summary.moves.map((move, i) => ({
          gameID: summary.id,
          source: move.move.source,
          target: move.move.target,
          promotion: move.move.promotion,
          turn: i,
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
