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

export interface LOBBYCONTEXT {
  present: boolean;
  lobby?: {
    id: string;
    config: {
      time?: {
        verbose: BW<number>;
        preset?: GameTimePreset;
      };
    };
  };
}

const defaultContext: LOBBYCONTEXT = {
  present: false,
  lobby: undefined,
};

type RdcrActnLoad = ReducerAction<"LOAD", LOBBYCONTEXT>;

type RdcrActnStart = ReducerAction<
  "START",
  {
    lobby: {
      id: UUID;
      config: NonNullable<LOBBYCONTEXT["lobby"]>["config"];
    };
  }
>;

type RdcrActnEnd = ReducerAction<"END", {}>;

type LobbyRdcrActn = RdcrActnLoad | RdcrActnStart | RdcrActnEnd;

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
