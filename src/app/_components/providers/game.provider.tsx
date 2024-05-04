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
  Player,
  GameSnapshot,
  Color,
  Movement,
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
    players: Partial<BW<Player>>;
    moves: VerboseMovement[];
    viewing?: {
      move: VerboseMovement;
      index: number;
      isLatest: boolean;
    };
    time: {
      start: number;
    };
    live?: {
      time: {
        lastUpdated: number;
        remaining?: BW<number>;
      };
      current: {
        fen: string;
        turn: Color;
      };
      engine: {
        getValidMoves: Chess["moves"];
      };
    };
  };
  conclusion?: {
    victor?: Color;
    reason: GameTermination;
  };
};

const defaultContext: GAMECONTEXT = {
  game: undefined,
  conclusion: undefined,
};

/**
 * Convert instance method exposed state into static object suitable for context.
 *
 * @param instance instance to extract state from
 * @returns an object containing game state fetched from instance methods
 */
function extractInstanceState(
  instance: Chess,
): NonNullable<NonNullable<GAMECONTEXT["game"]>["live"]>["current"] {
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
        live?: {
          FEN: string;
          time: {
            now: number;
            remaining?: BW<number>;
          };
        };
        id: string;
        moves: VerboseMovement[];
        players: Partial<BW<Player>>;
        time: {
          start: number;
        };
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
      "STEP",
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
      const { id, moves, players, time, live } = payload;

      const instance = live ? new Chess(live.FEN) : new Chess();

      return {
        game: {
          viewing:
            moves.length > 0
              ? {
                  index: moves.length - 1,
                  isLatest: true,
                  move: moves[moves.length - 1],
                }
              : undefined,
          id: id,
          players: players,
          moves: moves,
          time: {
            start: time.start,
          },
          live: live
            ? {
                current: extractInstanceState(instance),
                engine: { getValidMoves: instance.moves.bind(instance) },
                time: {
                  lastUpdated: live.time.now,
                  remaining: live.time.remaining,
                },
              }
            : undefined,
        },
      };
    }
    case "MOVE": {
      if (!state.game?.live) return { ...state };

      const { move, time, initiator, fen, captured } = payload;
      const instance = new Chess(state.game.live.current.fen);
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

      const moves = [
        ...state.game.moves,
        {
          initiator: initiator,
          fen: fen,
          move: move,
          time: time,
          captured: captured,
        },
      ];

      return {
        ...state,
        game: {
          ...state.game,
          moves: moves,
          live: {
            current: extractInstanceState(instance),
            engine: {
              getValidMoves: instance.moves.bind(instance),
            },
            time: {
              lastUpdated: time.timestamp,
              remaining: time.remaining,
            },
          },
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
        game: state.game
          ? {
              ...state.game,
              live: undefined,
            }
          : undefined,
        conclusion: payload.conclusion,
      };
    }
    case "STEP": {
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
          captured: data.captured,
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
          live: {
            FEN: data.FEN,
            time: {
              now: data.time.now,
              remaining: data.time.remaining,
            },
          },
          id: data.id,
          moves: data.moves,
          players: data.players,
          time: {
            start: data.time.start,
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
    //fetch initial LIVE context value from server
    if (query.isFetched && query.data) {
      const { data } = query;

      if (data.present)
        dispatchGame({
          type: "LOAD",
          payload: {
            id: data.game.id,
            moves: data.game.moves,
            players: data.game.players,
            time: {
              start: data.game.time.start,
            },
            live: {
              FEN: data.game.FEN,
              time: {
                now: data.game.time.now,
                remaining: data.game.time.remaining,
              },
            },
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
