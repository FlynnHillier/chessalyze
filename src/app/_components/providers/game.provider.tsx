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
} from "~/types/game.types";
import { ReducerAction } from "~/types/util/context.types";
import { trpc } from "~/app/_trpc/client";
import { ChessClock } from "~/lib/game/GameClock";
import { useWebSocket } from "next-ws/client";
import { GameEvent } from "~/lib/ws/events/game.event.ws";
import { GameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";
import { ExtractEmitData } from "~/lib/ws/events.ws.types";
import { validateWSMessage } from "~/app/_components/providers/ws.provider";

export interface GAMECONTEXT {
  present: boolean;
  game?: {
    id: UUID;
    players: BW<Player>;
    captured: BW<{ [key in CapturableSymbol]: number }>;
    engine: {
      clock?: ChessClock;
      instance: Chess;
    };
  };
}

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

type RdcrActnEnd = ReducerAction<"END", {}>;

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

type GameRdcrActn = RdcrActnLoad | RdcrActnEnd | RdcrActnMove;

function reducer<A extends GameRdcrActn>(
  state: GAMECONTEXT,
  action: A,
): GAMECONTEXT {
  const { type, payload } = action;

  switch (type) {
    case "LOAD":
      const { game, present } = payload;

      if (state.game?.engine.clock?.isActive()) {
        //stop any previous active clocks (shouldn't happen)
        state.game.engine.clock.stop();
      }

      const instance = game ? new Chess(game.FEN) : new Chess();
      const clockTimeOutCallback = (color: Color) => {};

      return {
        present: present,
        game: game && {
          id: game.id,
          players: game.players,
          captured: game.captured,
          engine: {
            clock: game.time.isTimed
              ? new ChessClock(game.time.remaining, clockTimeOutCallback)
              : undefined,
            instance: instance,
          },
        },
      };
    case "MOVE":
      if (!state.game) {
        return { ...state };
      }

      const initiator = state.game.engine.instance.turn();

      const movement = state.game.engine.instance.move({
        from: payload.move.source,
        to: payload.move.target,
        promotion: payload.move.promotion,
      });

      if (movement?.captured) {
        state.game.captured[initiator][movement.captured as PromotionSymbol]++;
      }

      if (state.game.engine.clock && payload.time.isTimed) {
        state.game.engine.clock.editDuration({
          w: payload.time.remaining.w,
          b: payload.time.remaining.b,
        });
        state.game.engine.clock.switch();
      }

      return { ...state };
    case "END":
      if (state.game?.engine.clock?.isActive()) {
        //stop any previous active clocks
        state.game.engine.clock.stop();
      }

      return {
        present: false,
        game: undefined,
      };
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

export function useGame() {
  return useContext(GameContext);
}

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const ws = useWebSocket();

  const [game, dispatchGame] = useReducer(reducer, defaultContext);
  const query = trpc.game.status.useQuery();

  /**
   * Handle incoming ws movement event
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
      }

      console.error("unexpected WS message event type: ", event);
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
