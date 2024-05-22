"use client";

import { ReactNode, useEffect } from "react";
import {
  GAMECONTEXT,
  GameRdcrActnLOAD,
  SERVERGAMECONTEXT,
  useDispatchGame,
  useGame,
} from "~/app/_components/providers/client/game.provider";

type GAMECONTEXTGAME = NonNullable<GAMECONTEXT["game"]>;
type GAMECONTEXTGAMELIVE = NonNullable<GAMECONTEXTGAME["live"]>;

export type ServerDispatchPayload = {
  game: {
    id: GAMECONTEXTGAME["id"];
    moves: GAMECONTEXTGAME["moves"];
    players: GAMECONTEXTGAME["players"];
    time: GAMECONTEXTGAME["time"];
    live?: {
      FEN: GAMECONTEXTGAMELIVE["current"]["fen"];
      time: {
        now: number;
        remaining: GAMECONTEXTGAMELIVE["time"]["remaining"];
      };
    };
  };
  config?: GameRdcrActnLOAD["payload"]["config"];
};

//TODO: can minimise / refine type of serverGame (not as much info as is current is required.)

/**
 * A client component which dispatches server game context passed as prop
 *
 */
export default function DispatchServerGameContext({
  children,
  payload,
}: {
  children?: ReactNode;
  payload: ServerDispatchPayload;
}) {
  const game = useGame();
  const dispatchGame = useDispatchGame();

  useEffect(() => {
    dispatchGame({
      type: "LOAD",
      payload: {
        game: {
          id: payload.game.id,
          moves: payload.game.moves,
          players: payload.game.players,
          time: payload.game.time,
          live: payload.game.live && {
            FEN: payload.game.live.FEN,
            time: {
              now: payload.game.live.time.now,
              remaining: payload.game.live.time.remaining,
            },
          },
        },
        config: {
          conclusion: {
            maintain: true,
          },
        },
      },
    });
  }, [payload]);

  return <>{children}</>;
}
