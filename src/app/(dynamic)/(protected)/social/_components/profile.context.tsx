"use client";

import { useWebSocket } from "next-ws/client";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { ReducerAction } from "~/types/util/context.types";

type GameResultsStat = {
  asWhite: number;
  asBlack: number;
  total: number;
};

/**
 * the structure of data included in the profile view context
 */
type ProfileData = {
  user: {
    id: string;
    imageURL: string | null;
    username: string;
  };
  stats: {
    lost: GameResultsStat;
    won: GameResultsStat;
    drawn: GameResultsStat;
    all: GameResultsStat;
  };
  friend?: {
    status: "confirmed" | "none" | "request_incoming" | "request_outgoing";
  };
  activity: {
    status: {
      isOnline: boolean;
      game?: string;
      messages: {
        primary?: string;
        secondary?: string;
      };
    };
  };
};

type ProfileContext = { profile?: ProfileData };

type ProfileReducerAction =
  | ReducerAction<"CLEAR_LOADED_PROFILE", {}>
  | ReducerAction<"LOAD_PROFILE", ProfileData>
  | ReducerAction<
      "FRIEND_STATUS_CHANGE",
      {
        status: Exclude<ProfileData["friend"], undefined>["status"];
      }
    >
  | ReducerAction<
      "ACTIVITY_STATUS_CHANGE",
      Exclude<ProfileData["activity"], undefined>["status"]
    >;

function profileReducer<A extends ProfileReducerAction>(
  state: ProfileContext,
  action: A,
): ProfileContext {
  const { type, payload } = action;

  switch (type) {
    case "CLEAR_LOADED_PROFILE": {
      return {
        profile: undefined,
      };
    }
    case "LOAD_PROFILE": {
      return {
        profile: payload,
      };
    }
    case "FRIEND_STATUS_CHANGE": {
      return {
        ...state,
        profile: state.profile && {
          ...state.profile,
          friend: {
            status: payload.status,
          },
        },
      };
    }
    case "ACTIVITY_STATUS_CHANGE": {
      return {
        ...state,
        profile: state.profile && {
          ...state.profile,
          activity: {
            status: {
              isOnline: payload.isOnline,
              game: payload.game,
              messages: {
                primary: payload.messages.primary,
                secondary: payload.messages.secondary,
              },
            },
          },
        },
      };
    }
  }
}

const PROFILEVIEWCONTEXT = createContext<{
  profile: ProfileContext;
  dispatchProfile: Dispatch<ProfileReducerAction>;
}>(
  {} as {
    profile: ProfileContext;
    dispatchProfile: Dispatch<ProfileReducerAction>;
  },
);

const defaultContext: ProfileContext = {
  profile: undefined,
};

/**
 *
 * Provide details regarding a user profile to child components
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket();

  const [profile, dispatchProfile] = useReducer(profileReducer, defaultContext);

  useEffect(() => {
    function sendSubscribeEvent(): boolean {
      if (!profile.profile?.user.id || !ws || ws.readyState !== ws.OPEN)
        return false;
      ws.send(
        wsClientToServerMessage
          .send("PROFILE:ACTIVITY_SUBSCRIBE")
          .data({
            profileUserID: profile.profile.user.id,
          })
          .stringify(),
      );

      return true;
    }

    function sendUnSubscribeEvent(): boolean {
      if (!profile.profile?.user.id || !ws || ws.readyState !== ws.OPEN)
        return false;
      ws.send(
        wsClientToServerMessage
          .send("PROFILE:ACTIVITY_UNSUBSCRIBE")
          .data({
            profileUserID: profile.profile.user.id,
          })
          .stringify(),
      );

      return true;
    }

    sendSubscribeEvent();
    window.addEventListener("beforeunload", sendUnSubscribeEvent);

    return () => {
      sendUnSubscribeEvent();
      window.removeEventListener("beforeunload", sendUnSubscribeEvent);
    };
  }, [ws?.readyState, profile.profile?.user.id]);

  return (
    <PROFILEVIEWCONTEXT.Provider value={{ profile, dispatchProfile }}>
      {children}
    </PROFILEVIEWCONTEXT.Provider>
  );
}

export function useProfile() {
  return useContext(PROFILEVIEWCONTEXT).profile;
}

export function useDispatchProfile() {
  return useContext(PROFILEVIEWCONTEXT).dispatchProfile;
}
