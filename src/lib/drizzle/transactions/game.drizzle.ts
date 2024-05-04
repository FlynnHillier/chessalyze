import { GameSummary, Player } from "~/types/game.types";
import { db } from "~/lib/drizzle/db";
import {
  captured,
  conclusions,
  games,
  moves,
  timings,
} from "~/lib/drizzle/games.schema";
import { users } from "~/lib/drizzle/auth.schema";
import { logDev, loggingColourCode } from "~/lib/logging/dev.logger";
import { eq, InferSelectModel, or } from "drizzle-orm";
import { InferQueryResultType, QueryConfig } from "~/types/drizzle.types";
import { ChessImageGenerator } from "@flynnhillier/chessboard-image-gen";
import path from "path";
import { PUBLIC_FOLDER_PATH } from "~/config/config";

type PgUser = InferSelectModel<typeof users>;

/**
 * Generic query which selects fields necessary for constructing GameSummary from database.
 */
const GameSummaryWithQuery = {
  moves: {
    with: {
      initiator: true,
      captured: true,
    },
  },
  player_black: true,
  player_white: true,
  conclusion: {
    with: {
      victor: true,
    },
  },
  timings: true,
} as const satisfies QueryConfig<"games">["with"];

/**
 * The return type of a query for a db Game Summary
 */
type PgGameSummaryQueryType = InferQueryResultType<
  "games",
  {
    with: typeof GameSummaryWithQuery;
  }
>;

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
 * convert database game summary query result to GameSummary object
 *
 * @param pgGameSummary pg game summary to be converted to native game summary
 * @returns GameSummary
 */
function pgGameSummaryQueryResultToGameSummary(
  pgGameSummary: PgGameSummaryQueryType,
): GameSummary {
  return {
    id: pgGameSummary.id,
    conclusion: {
      victor:
        pgGameSummary.conclusion.termination_type === "draw"
          ? null
          : pgGameSummary.conclusion.termination_type,
      boardState: pgGameSummary.conclusion.fen,
      termination: pgGameSummary.conclusion.termination_message,
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
      start: pgGameSummary.timings.start,
      end: pgGameSummary.timings.end,
      duration: pgGameSummary.timings.duration,
      clock: pgGameSummary.timings.clock
        ? {
            initial: {
              absolute: {
                w: pgGameSummary.timings.clock_start_w ?? -1,
                b: pgGameSummary.timings.clock_start_b ?? -1,
              },
              template: pgGameSummary.timings.clock_template ?? undefined,
            },
            end: {
              absolute: {
                w: pgGameSummary.timings.clock_end_w ?? -1,
                b: pgGameSummary.timings.clock_end_b ?? -1,
              },
            },
          }
        : undefined,
    },
    moves: pgGameSummary.moves.map((pgMove) => ({
      fen: pgMove.fen,
      initiator: {
        player: pgMove.initiator ? pgUserToPlayer(pgMove.initiator) : undefined,
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
        sinceStart: pgMove.t_timestamp - pgGameSummary.timings.start,
      },
      captured: {
        w: {
          b: pgMove.captured.w_b,
          n: pgMove.captured.w_n,
          p: pgMove.captured.w_p,
          q: pgMove.captured.w_q,
          r: pgMove.captured.w_r,
        },
        b: {
          b: pgMove.captured.b_b,
          n: pgMove.captured.b_n,
          p: pgMove.captured.b_p,
          q: pgMove.captured.b_q,
          r: pgMove.captured.b_r,
        },
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

      await tx.insert(captured).values(
        summary.moves.map((move, i) => ({
          gameID: summary.id,
          turnIndex: i,
          b_b: move.captured.b.b,
          b_n: move.captured.b.n,
          b_p: move.captured.b.p,
          b_q: move.captured.b.q,
          b_r: move.captured.b.r,
          w_b: move.captured.w.b,
          w_n: move.captured.w.n,
          w_p: move.captured.w.p,
          w_q: move.captured.w.q,
          w_r: move.captured.w.r,
        })),
      );

      await tx.insert(conclusions).values({
        gameID: summary.id,
        fen: summary.conclusion.boardState,
        termination_message: summary.conclusion.termination,
        termination_type: summary.conclusion.victor ?? "draw",
        victor_pid: summary.conclusion.victor
          ? summary.players[summary.conclusion.victor]?.pid
          : null,
      });

      await tx.insert(timings).values({
        gameID: summary.id,
        duration: summary.time.duration,
        start: summary.time.start,
        end: summary.time.end,
        clock: !!summary.time.clock,
        clock_template: summary.time.clock?.initial.template,
        clock_start_w: summary.time.clock?.initial.absolute.w,
        clock_start_b: summary.time.clock?.initial.absolute.b,
        clock_end_w: summary.time.clock?.end.absolute.w,
        clock_end_b: summary.time.clock?.end.absolute.b,
      });
    });
  } catch (e) {
    //TODO: add physical storage logging here.
    logDev({
      message: ["failed to store game in datatbase", e],
      color: loggingColourCode.FgRed,
    });
  }

  try {
    await ChessImageGenerator.fromFEN(
      summary.conclusion.boardState,
      path.join(PUBLIC_FOLDER_PATH, "chess", "games", `${summary.id}.png`),
    );
  } catch (e) {
    logDev({
      message: ["failed to store game image to public folder", e],
      color: loggingColourCode.FgRed,
    });
  }
}

/**
 * fetch a game summary from database, given the game's id.
 *
 * @param gameID id of game to fetch summary of
 * @returns Promise<GameSummary>
 */
export async function getGameSummary(
  gameID: string,
): Promise<GameSummary | null> {
  const result: PgGameSummaryQueryType | null =
    (await db.query.games.findFirst({
      with: GameSummaryWithQuery,
      where: eq(games.id, gameID),
    })) ?? null;

  if (!result) return null;

  return pgGameSummaryQueryResultToGameSummary(result);
}

/**
 * get game summary's related to specified player
 *
 * @param playerID player of whom game's should be fetched for
 * @param \{count?} the maximum number of games to fetch. If true, fetch all. Defaults to 20.
 * @returns Promise<GameSummarry[]>
 */
export async function getPlayerGameSummarys(
  playerID: string,
  { count }: { count?: true | number } = {},
): Promise<GameSummary[]> {
  count = count ?? 20;

  const results = await db.query.games.findMany({
    with: GameSummaryWithQuery,
    where: or(eq(games.p_black_id, playerID), eq(games.p_white_id, playerID)),
    limit: count === true ? undefined : count,
  });

  return results.map((r) => pgGameSummaryQueryResultToGameSummary(r));
}

/**
 * get the x most recent game summarys
 *
 * @param \{count?} the maximum number of games to fetch. If true, fetch all. Defaults to 20.
 * @returns Promise<GameSummarry[]>
 */
export async function getRecentGameSummarys({
  count,
}: {
  count?: number | true;
} = {}) {
  count = count ?? 20;

  const results = await db.query.games.findMany({
    with: GameSummaryWithQuery,
    limit: count === true ? undefined : count,
    // orderBy: (timings, { desc }) => [desc(timings.)], //TODO: fix this to order by child table timings.end
  });

  return results.map((r) => pgGameSummaryQueryResultToGameSummary(r));
}
