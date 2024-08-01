"use client";

import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import { ReducerAction } from "~/types/util/context.types";
import { BW, GameTimePreset } from "~/types/game.types";
import { trpc } from "~/app/_trpc/client";
import { Color } from "chess.js";
import { AtleastOneKey } from "~/types/util/util.types";
import { useWebSocket } from "next-ws/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { useGlobalError } from "./globalError.provider";

export interface LOBBYCONTEXT {
  present: boolean;
  lobby?: {
    id: string;
    config: {
      time?: AtleastOneKey<{
        absolute?: BW<number>;
        template?: GameTimePreset;
      }>;
      color?: {
        preference: Color;
      };
    };
    accessibility: {
      invited: string[];
      isPublicLinkAllowed: boolean;
    };
  };
}

const defaultContext: LOBBYCONTEXT = {
  present: false,
  lobby: undefined,
};

type LobbyRdcrActn =
  | ReducerAction<"LOAD", LOBBYCONTEXT>
  | ReducerAction<"UPDATE", NonNullable<LOBBYCONTEXT["lobby"]>>
  | ReducerAction<"END", {}>;

function reducer<A extends LobbyRdcrActn>(
  state: LOBBYCONTEXT,
  action: A,
): LOBBYCONTEXT {
  const { type, payload } = action;

  switch (type) {
    case "LOAD":
      return payload;
    case "UPDATE":
      return {
        present: true,
        lobby: payload,
      };
    case "END":
      return {
        present: false,
        lobby: undefined,
      };
    default:
      return { ...state };
  }
}

const LobbyContext = createContext(
  {} as {
    lobby: LOBBYCONTEXT;
    dispatchLobby: Dispatch<LobbyRdcrActn>;
  },
);

export function useLobby() {
  return useContext(LobbyContext);
}

export const LobbyProvider = ({ children }: { children: ReactNode }) => {
  const { showGlobalError } = useGlobalError();

  const [lobby, dispatchLobby] = useReducer(reducer, defaultContext);
  const ownLobbyStatusQuery = trpc.lobby.query.own.useQuery(undefined, {
    onSettled(data, error) {
      if (error) showGlobalError(error.message);
      else if (data)
        dispatchLobby({
          type: "LOAD",
          payload: {
            present: data.exists,
            lobby: data.lobby && {
              id: data.lobby.id,
              config: {
                color: data.lobby.config.color,
                time: data.lobby.config.time,
              },
              accessibility: {
                invited: data.lobby.accessibility.invited,
                isPublicLinkAllowed:
                  data.lobby.accessibility.isPublicLinkAllowed,
              },
            },
          },
        });
    },
  });
  const ws = useWebSocket();

  useEffect(() => {
    function onWSMessageEvent(e: MessageEvent) {
      wsServerToClientMessage.receiver({
        "LOBBY:END": ({}) => {
          dispatchLobby({
            type: "END",
            payload: {},
          });
        },
        "LOBBY:UPDATE": (lobby) => {
          dispatchLobby({
            type: "UPDATE",
            payload: lobby,
          });
        },
      })(e.data);
    }

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  return (
    <LobbyContext.Provider value={{ lobby, dispatchLobby }}>
      {children}
    </LobbyContext.Provider>
  );
};
