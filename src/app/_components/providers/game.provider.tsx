"use client";

import {
  ReactNode,
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { Chess } from "chess.js";
import { UUID } from "~/types/common.types";
import {
  BW,
  CapturableSymbol,
  Player,
  PromotionSymbol,
  GameSnapshot,
  Color,
  Movement,
  GameSummary,
  VerboseMovement,
  GameTermination,
} from "~/types/game.types";
import { ReducerAction } from "~/types/util/context.types";
import { trpc } from "~/app/_trpc/client";
import { useWebSocket } from "next-ws/client";
import { GameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";
import { validateWSMessage } from "~/app/_components/providers/ws.provider";
import { GameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { GameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";
import { ExactlyOneKey } from "~/types/util/util.types";

export type GAMECONTEXT = {
  game?: {
    id: UUID;
    players: BW<Player>;
    captured: BW<{ [key in CapturableSymbol]: number }>;
    state: {
      fen: string;
      turn: Color;
    };
    engine: {
      getValidMoves: Chess["moves"];
    };
    time: {
      start: number;
      lastUpdated: number;
      remaining?: BW<number>;
    };
    moves: VerboseMovement[];
    viewing?: {
      move: VerboseMovement; // This should be the move that allows retrospective viewing
      index: number;
      isLatest: boolean;
    };
  };
  live: boolean;
  conclusion?: {
    victor?: Color;
    reason: GameTermination;
  };
};

const defaultContext: GAMECONTEXT = {
  game: undefined,
  live: false,
};

type RdcrActnMove = ReducerAction<"MOVE", VerboseMovement>;

/**
 * Convert instance method exposed state into static object suitable for context.
 *
 * @param instance instance to extract state from
 * @returns an object containing game state fetched from instance methods
 */
function extractInstanceState(
  instance: Chess,
): NonNullable<GAMECONTEXT["game"]>["state"] {
  return {
    fen: instance.fen(),
    turn: instance.turn(),
  };
}

/**
 * Check if move is currently valid for a given Chess instance
 *
 * @param instance Chess instance
 * @param move move to query for
 * @returns true if specified move is valid move within specified Chess instance
 */
function moveIsValid(instance: Chess, move: Movement): boolean {
  return !!instance
    .moves({ verbose: true })
    .find(
      (m) =>
        m.from === move.source &&
        m.to === move.target &&
        m.promotion === move.promotion,
    );
}

type GameRdcrActn =
  | ReducerAction<
      "LOAD",
      {
        live: boolean;
        game?: GameSnapshot;
      }
    >
  | ReducerAction<
      "END",
      {
        conclusion: NonNullable<GAMECONTEXT["conclusion"]>;
      }
    >
  | ReducerAction<"MOVE", VerboseMovement>
  | ReducerAction<
      "VIEW",
      ExactlyOneKey<{
        latest: true;
        index: ExactlyOneKey<{
          relative: number;
          value: number;
        }>;
      }>
    >;

function reducer<A extends GameRdcrActn>(
  state: GAMECONTEXT,
  action: A,
): GAMECONTEXT {
  const { type, payload } = action;

  switch (type) {
    case "LOAD": {
      const { game, live } = payload;

      if (!game) {
        return {
          game: undefined,
          live: false,
        };
      }

      const instance = game ? new Chess(game.FEN) : new Chess();

      return {
        game: game && {
          id: game.id,
          players: game.players,
          captured: game.captured,
          state: extractInstanceState(instance),
          engine: {
            getValidMoves: instance.moves.bind(instance),
          },
          time: {
            start: game.time.start,
            lastUpdated: game.time.now,
            remaining: game.time.remaining,
          },
          moves: game.moves,
        },
        live: live,
      };
    }
    case "MOVE": {
      if (!state.game || !state.live) return { ...state };

      const { move, time, initiator, fen } = payload;
      const instance = new Chess(state.game.state.fen);
      const turn = instance.turn();

      if (!moveIsValid(instance, move)) {
        console.error(`Invalid movement event!`, payload.move);
        console.log("setting state", { ...state });
        return { ...state };
      }

      const movement = instance.move({
        from: payload.move.source,
        to: payload.move.target,
        promotion: payload.move.promotion,
      });

      if (movement?.captured) {
        // Update captured pieces
        state.game.captured[turn][movement.captured as PromotionSymbol]++;
      }

      const moves = [
        ...state.game.moves,
        {
          initiator: initiator,
          fen: fen,
          move: move,
          time: time,
        },
      ];

      return {
        ...state,
        game: {
          ...state.game,
          state: extractInstanceState(instance),
          engine: {
            getValidMoves: instance.moves.bind(instance),
          },
          time: {
            start: state.game.time.start,
            lastUpdated: time.timestamp,
            remaining: time.remaining,
          },
          moves: moves,
          viewing: {
            isLatest: true,
            index: moves.length - 1,
            move: moves[moves.length - 1],
          }, // Jump to latest move
        },
      };
    }
    case "END": {
      return {
        game: state.game,
        live: false,
        conclusion: payload.conclusion,
      };
    }
    case "VIEW": {
      if (!state.game) return { ...state };

      // View latest
      if (payload.latest) {
        if (state.game.moves.length > 0)
          return {
            ...state,
            game: {
              ...state.game,
              viewing: {
                index: state.game.moves.length - 1,
                move: state.game.moves[state.game.moves.length - 1],
                isLatest: true,
              },
            },
          };
        else return { ...state };
      }

      // View specified
      if (payload.index === undefined) return { ...state };

      const targetIndex = Math.max(
        Math.min(
          state.game.moves.length - 1,
          (payload.index.value ?? state.game.viewing?.index ?? -1) +
            (payload.index.relative ?? 0),
        ),
        -1,
      );

      if (targetIndex <= -1)
        return {
          ...state,
          game: {
            ...state.game,
            viewing: undefined,
          },
        };

      return {
        ...state,
        game: {
          ...state.game,
          viewing: {
            index: targetIndex,
            move: state.game.moves[targetIndex],
            isLatest: targetIndex === state.game.moves.length - 1,
          },
        },
      };
    }
    default:
      return { ...state };
  }
}

const GameContext = createContext(
  {} as {
    game: GAMECONTEXT;
    dispatchGame: Dispatch<GameRdcrActn>;
  },
);

export function useGame(): GAMECONTEXT {
  return useContext(GameContext).game;
}

export function useDispatchGame(): Dispatch<GameRdcrActn> {
  return useContext(GameContext).dispatchGame;
}

export const GameProvider = ({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: GAMECONTEXT;
}) => {
  const ws = useWebSocket();

  const [game, dispatchGame] = useReducer(reducer, initial ?? defaultContext);
  const query = trpc.game.status.useQuery();

  /**
   * Handle incoming ws game movement event
   */
  const onWSMovementEvent = useCallback(
    (data: GameMoveEvent["data"]) => {
      //TODO: zod validation
      dispatchGame({
        type: "MOVE",
        payload: {
          fen: data.fen,
          move: {
            piece: data.move.piece,
            source: data.move.source,
            target: data.move.target,
            promotion: data.move.promotion,
          },
          time: {
            timestamp: data.time.timestamp,
            remaining: data.time.remaining,
            sinceStart: data.time.sinceStart,
            moveDuration: data.time.moveDuration,
          },
          initiator: data.initiator,
        },
      });
    },
    [dispatchGame],
  );

  /**
   * Handle incoming ws game join event
   */
  const onWSGameJoinEvent = useCallback(
    (data: GameJoinEvent["data"]) => {
      //TODO: zod validation
      dispatchGame({
        type: "LOAD",
        payload: {
          live: true,
          game: {
            id: data.id,
            players: data.players,
            FEN: data.FEN,
            time: {
              start: data.time.start,
              now: data.time.now,
              remaining: data.time.remaining,
            },
            captured: data.captured,
            moves: data.moves,
          },
        },
      });
    },
    [dispatchGame],
  );

  /**
   * Handle incoming ws game end event
   */
  const onWSGameEndEvent = useCallback(
    (data: GameEndEvent["data"]) => {
      //TODO: zod validation
      dispatchGame({
        type: "END",
        payload: {
          conclusion: {
            victor: data.conclusion.victor ?? undefined,
            reason: data.conclusion.termination,
          },
        },
      });
    },
    [dispatchGame],
  );

  /**
   * Handle different incoming ws message events
   */
  const onWSMessageEvent = useCallback(
    (e: MessageEvent<string>) => {
      const valid = validateWSMessage(e);
      if (!valid) return;
      const { event, data } = valid;

      switch (event) {
        case "GAME_MOVE":
          onWSMovementEvent(data);
          return;
        case "GAME_JOIN":
          onWSGameJoinEvent(data);
          return;
        case "GAME_END":
          onWSGameEndEvent(data);
          return;
      }
    },
    [dispatchGame],
  );

  useEffect(() => {
    console.log("registering listeners", ws);

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws, onWSMessageEvent]);

  useEffect(() => {
    //fetch initial context value from server
    if (query.isFetched && query.data) {
      const { data } = query;
      dispatchGame({
        type: "LOAD",
        payload: {
          game: data.present
            ? {
                id: data.game.id,
                FEN: data.game.FEN,
                players: data.game.players,
                captured: data.game.captured,
                time: {
                  start: data.game.time.start,
                  now: data.game.time.now,
                  remaining: data.game.time.remaining,
                },
                moves: data.game.moves,
              }
            : undefined,
          live: data.present,
        },
      });
    }

    return;
  }, [query.isLoading]);

  return (
    <GameContext.Provider value={{ game, dispatchGame }}>
      {children}
    </GameContext.Provider>
  );
};
