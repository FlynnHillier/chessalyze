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
  Square,
  Movement,
  GameSummary,
} from "~/types/game.types";
import { ReducerAction } from "~/types/util/context.types";
import { trpc } from "~/app/_trpc/client";
import { ChessClock } from "~/lib/game/GameClock";
import { useWebSocket } from "next-ws/client";
import { GameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";
import { validateWSMessage } from "~/app/_components/providers/ws.provider";
import { GameJoinEvent } from "~/lib/ws/events/game/game.join.event.ws";
import { GameEndEvent } from "~/lib/ws/events/game/game.end.event.ws";

export type GAMECONTEXT =
  | {
      present: false;
      game: undefined;
      conclusion?: {
        players: GameSummary["players"];
        conclusion: GameSummary["conclusion"];
      };
    }
  | {
      present: true;
      game: {
        id: UUID;
        players: BW<Player>;
        captured: BW<{ [key in CapturableSymbol]: number }>;
        state: {
          fen: string;
          turn: Color;
        };
        engine: {
          clock?: ChessClock;
          getValidMoves: Chess["moves"];
        };
      };
      conclusion: undefined;
    };

const defaultContext: GAMECONTEXT = {
  present: false,
  game: undefined,
};

type RdcrActnLoad = ReducerAction<
  "LOAD",
  {
    present: boolean;
    game?: GameSnapshot;
  }
>;

type RdcrActnEnd = ReducerAction<
  "END",
  {
    conclusion: NonNullable<GAMECONTEXT["conclusion"]>;
  }
>;

type RdcrActnMove = ReducerAction<
  "MOVE",
  {
    move: {
      source: Square;
      target: Square;
      promotion?: PromotionSymbol;
    };
    time:
      | {
          isTimed: false;
        }
      | {
          isTimed: true;
          remaining: BW<number>;
        };
  }
>;

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

type GameRdcrActn = RdcrActnLoad | RdcrActnEnd | RdcrActnMove;

//TODO: just re-instantiate Chess instance with new fen when we move.

function reducer<A extends GameRdcrActn>(
  state: GAMECONTEXT,
  action: A,
): GAMECONTEXT {
  const { type, payload } = action;

  switch (type) {
    case "LOAD": {
      const { game, present } = payload;

      if (state.game?.engine.clock?.isActive()) {
        //stop any previous active clocks (shouldn't happen)
        state.game.engine.clock.stop();
      }

      const instance = game ? new Chess(game.FEN) : new Chess();
      const clockTimeOutCallback = (color: Color) => {};

      if (!present || !game) {
        return {
          present: false,
          game: undefined,
        };
      }

      return {
        present: present,
        game: game && {
          id: game.id,
          players: game.players,
          captured: game.captured,
          state: extractInstanceState(instance),
          engine: {
            getValidMoves: instance.moves.bind(instance),
            clock: game.time.isTimed
              ? new ChessClock(game.time.remaining, clockTimeOutCallback)
              : undefined,
          },
        },
        conclusion: undefined,
      };
    }
    case "MOVE": {
      if (!state.game) return { ...state };

      const { move, time } = payload;
      const { clock } = state.game.engine;
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

      if (clock && time.isTimed) {
        // Switch & sync client clock if game is timed.
        clock.editDuration({
          w: time.remaining.w,
          b: time.remaining.b,
        });
        clock.switch();
      }

      return {
        ...state,
        game: {
          ...state.game,
          state: extractInstanceState(instance),
          engine: {
            clock: clock,
            getValidMoves: instance.moves.bind(instance),
          },
        },
      };
    }
    case "END": {
      if (state.game?.engine.clock?.isActive()) {
        //stop any previous active clocks
        state.game.engine.clock.stop();
      }

      return {
        present: false,
        game: undefined,
        conclusion: payload.conclusion,
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

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const ws = useWebSocket();

  const [game, dispatchGame] = useReducer(reducer, defaultContext);
  const query = trpc.game.status.useQuery();

  /**
   * Handle incoming ws game movement event
   */
  const onWSMovementEvent = useCallback(
    (data: GameMoveEvent["data"]) => {
      console.log("ws movement event", data);

      //TODO: zod validation
      dispatchGame({
        type: "MOVE",
        payload: {
          move: {
            source: data.move.source,
            target: data.move.target,
            promotion: data.move.promotion,
          },
          time: {
            isTimed: data.time.isTimed,
            remaining: data.time.remaining,
          },
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
          present: true,
          game: {
            id: data.id,
            players: data.players,
            FEN: data.FEN,
            time: {
              isTimed: data.time.isTimed,
              remaining: data.time.remaining,
            },
            captured: data.captured,
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
            conclusion: data.conclusion,
            players: data.players,
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
          present: data.present,
          game: data.present
            ? {
                id: data.game.id,
                FEN: data.game.FEN,
                players: data.game.players,
                captured: data.game.captured,
                time: {
                  isTimed: data.game.time.isTimed,
                  remaining: data.game.time.remaining,
                },
              }
            : undefined,
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
