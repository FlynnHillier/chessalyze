import { GameSummary, Player } from "~/types/game.types";
import { db } from "~/lib/drizzle/db";
import { conclusions, games, moves } from "~/lib/drizzle/games.schema";
import { users } from "~/lib/drizzle/auth.schema";
import { logDev, loggingColourCode } from "~/lib/logging/dev.logger";
import { eq, InferSelectModel, or } from "drizzle-orm";
import { InferQueryResultType, QueryConfig } from "~/types/drizzle.types";

type PgUser = InferSelectModel<typeof users>;

/**
 * Generic query which selects fields necessary for constructing GameSummary from database.
 */
const GameSummaryWithQuery = {
  moves: {
    with: {
      initiator: true,
    },
  },
  player_black: true,
  player_white: true,
  conclusion: {
    with: {
      victor: true,
    },
  },
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
      start: pgGameSummary.t_start,
      end: pgGameSummary.t_end,
      duration: pgGameSummary.t_duration,
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

      await tx.insert(conclusions).values({
        gameID: summary.id,
        fen: summary.conclusion.boardState,
        termination_message: summary.conclusion.termination,
        termination_type: summary.conclusion.victor ?? "draw",
        victor_pid: summary.conclusion.victor
          ? summary.players[summary.conclusion.victor]?.pid
          : null,
      });
    });
  } catch (e) {
    //TODO: add physical storage logging here.
    logDev({
      message: ["failed to store game in datatbase", e],
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
    orderBy: (games, { desc }) => [desc(games.t_end)],
  });

  return results.map((r) => pgGameSummaryQueryResultToGameSummary(r));
}
