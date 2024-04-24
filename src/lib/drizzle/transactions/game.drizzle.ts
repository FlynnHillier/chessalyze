import { GameSummary, Player } from "~/types/game.types";
import { db } from "~/lib/drizzle/db";
import { games, moves } from "~/lib/drizzle/games.schema";
import { users } from "~/lib/drizzle/auth.schema";
import { logDev, loggingColourCode } from "~/lib/logging/dev.logger";
import { eq, InferSelectModel } from "drizzle-orm";

type PgUser = InferSelectModel<typeof users>;

/**
 * typescript type for drizzle game table including relations
 */
type PgGameSummary = InferSelectModel<typeof games> & {
  moves: (InferSelectModel<typeof moves> & {
    initiator: PgUser;
  })[];
  player_white: PgUser;
  player_black: PgUser;
};

/**
 * convert database user to object compatible with game section of application
 *
 * @param pgUser pg user to be converted
 * @returns Player
 */
function pgUserToPlayer(pgUser: PgUser): Player {
  return {
    username: pgUser.name,
    pid: pgUser.id,
    image: pgUser.image ?? undefined,
  };
}

/**
 * convert database game summary to object compatible with rest of application
 *
 * @param pgGameSummary pg game summary to be converted to native game summary
 * @returns GameSummary
 */
function pgGameSummaryToGameSummary(pgGameSummary: PgGameSummary): GameSummary {
  return {
    id: pgGameSummary.id,
    conclusion: {
      boardState: "",
      termination: "stalemate",
      victor: "w",
    },
    players: {
      w: pgGameSummary.player_white
        ? pgUserToPlayer(pgGameSummary.player_white)
        : undefined,
      b: pgGameSummary.player_black
        ? pgUserToPlayer(pgGameSummary.player_black)
        : undefined,
    },
    time: {
      start: pgGameSummary.t_start,
      end: pgGameSummary.t_end,
      duration: pgGameSummary.t_duration,
    },
    moves: pgGameSummary.moves.map((pgMove) => ({
      fen: pgMove.fen,
      initiator: {
        player: pgMove.initiator_pid
          ? pgUserToPlayer(pgMove.initiator)
          : undefined,
        color: pgMove.initiator_color,
      },
      move: {
        piece: pgMove.piece,
        source: pgMove.source,
        target: pgMove.target,
        promotion: pgMove.promotion ?? undefined,
      },
      time: {
        moveDuration: pgMove.t_duration,
        timestamp: pgMove.t_timestamp,
        sinceStart: pgMove.t_timestamp - pgGameSummary.t_start,
      },
    })),
  };
}

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
        p_black_id: summary.players.b?.pid,
        p_white_id: summary.players.w?.pid,
        t_duration: summary.time.duration,
        t_start: summary.time.start,
        t_end: summary.time.end,
      });

      await tx.insert(moves).values(
        summary.moves.map((move, i) => ({
          gameID: summary.id,
          turn: i,
          fen: move.fen,
          initiator_pid: move.initiator.player?.pid,
          initiator_color: move.initiator.color,
          piece: move.move.piece,
          source: move.move.source,
          target: move.move.target,
          promotion: move.move.promotion,
          t_timestamp: move.time.timestamp,
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

export async function getGameSummary(
  gameID: string,
  // ): Promise<GameSummary | null> {
) {
  return (
    (await db.query.games.findFirst({
      with: {
        moves: {
          with: {
            initiator: true,
          },
        },
        player_white: true,
        player_black: true,
      },
      where: eq(games.id, gameID),
    })) ?? null
  );
}
