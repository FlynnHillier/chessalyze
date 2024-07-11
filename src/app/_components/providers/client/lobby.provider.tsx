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
import { UUID } from "~/types/common.types";
import { BW, GameTimePreset } from "~/types/game.types";
import { trpc } from "~/app/_trpc/client";
import { Color } from "chess.js";
import { AtleastOneKey } from "~/types/util/util.types";
import { useWebSocket } from "next-ws/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

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
  };
}

const defaultContext: LOBBYCONTEXT = {
  present: false,
  lobby: undefined,
};

type LobbyRdcrActn =
  | ReducerAction<"LOAD", LOBBYCONTEXT>
  | ReducerAction<
      "START",
      {
        lobby: {
          id: UUID;
          config: NonNullable<LOBBYCONTEXT["lobby"]>["config"];
        };
      }
    >
  | ReducerAction<"END", {}>;

function reducer<A extends LobbyRdcrActn>(
  state: LOBBYCONTEXT,
  action: A,
): LOBBYCONTEXT {
  const { type, payload } = action;

  switch (type) {
    case "LOAD":
      return payload;
    case "START":
      return {
        present: true,
        lobby: {
          id: payload.lobby.id,
          config: payload.lobby.config,
        },
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
  const [lobby, dispatchLobby] = useReducer(reducer, defaultContext);
  const query = trpc.lobby.status.useQuery();
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
        "LOBBY:JOIN": ({ lobbyID, config }) => {
          dispatchLobby({
            type: "START",
            payload: {
              lobby: {
                config: {
                  color: config.color && {
                    preference: config.color.preference,
                  },
                  time: config.time && {
                    absolute: config.time.absolute,
                    template: config.time.template,
                  },
                },
                id: lobbyID,
              },
            },
          });
        },
      })(e.data);
    }

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  useEffect(() => {
    //load initial lobby context
    if (query.isFetched && query.data) {
      dispatchLobby({
        type: "LOAD",
        payload: query.data,
      });
    }
  }, [query.isLoading]);

  return (
    <LobbyContext.Provider value={{ lobby, dispatchLobby }}>
      {children}
    </LobbyContext.Provider>
  );
};
