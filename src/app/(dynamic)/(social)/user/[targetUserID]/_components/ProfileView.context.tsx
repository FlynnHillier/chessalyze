import { useWebSocket } from "next-ws/client";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { trpc } from "~/app/_trpc/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
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
};

type ProfileContext = { profile?: ProfileData; isLoading: boolean };

type ProfileReducerAction =
  | ReducerAction<
      "FRIEND_STATUS_CHANGE",
      {
        status: Exclude<ProfileData["friend"], undefined>["status"];
      }
    >
  | ReducerAction<"INITIAL_LOAD", ProfileData>;

function profileReducer<A extends ProfileReducerAction>(
  state: ProfileContext,
  action: A,
): ProfileContext {
  const { type, payload } = action;

  switch (type) {
    case "INITIAL_LOAD": {
      if (!state.isLoading) return { ...state };

      return {
        isLoading: false,
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
  isLoading: true,
  profile: undefined,
};

/**
 *
 * Provide details regarding a user profile to child components
 */
export function ProfileViewProvider({
  children,
  target,
}: {
  children: ReactNode;
  target: { id: string };
}) {
  const ws = useWebSocket();
  const loadProfileInformationQuery = trpc.social.profile.user.useQuery({
    targetUserID: target.id,
  });

  const [profile, dispatchProfile] = useReducer(profileReducer, defaultContext);

  useEffect(() => {
    // update state when websocket events are received
    const onWSMessageEvent = (m: MessageEvent) => {
      wsServerToClientMessage.receiver({
        SOCIAL_PERSONAL_UPDATE: ({ playerID, new_status }) => {
          if (playerID === target.id) {
            if (new_status === "confirmed")
              dispatchProfile({
                type: "FRIEND_STATUS_CHANGE",
                payload: { status: "confirmed" },
              });
            else if (new_status === "none")
              dispatchProfile({
                type: "FRIEND_STATUS_CHANGE",
                payload: { status: "none" },
              });
            else if (new_status === "request_incoming")
              dispatchProfile({
                type: "FRIEND_STATUS_CHANGE",
                payload: { status: "request_incoming" },
              });
            else if (new_status === "request_outgoing")
              dispatchProfile({
                type: "FRIEND_STATUS_CHANGE",
                payload: { status: "request_outgoing" },
              });
          }
        },
      })(m.data);
    };

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  useEffect(() => {
    if (loadProfileInformationQuery.data) {
      const { profile, stats, friend } = loadProfileInformationQuery.data;
      const { won, lost, drawn, all } = stats.games;
      dispatchProfile({
        type: "INITIAL_LOAD",
        payload: {
          user: {
            id: profile.id,
            imageURL: profile.imageURL,
            username: profile.username,
          },
          stats: {
            won: {
              total: won.total,
              asBlack: won.asBlack,
              asWhite: won.asWhite,
            },
            lost: {
              total: lost.total,
              asBlack: lost.asBlack,
              asWhite: lost.asWhite,
            },
            drawn: {
              total: drawn.total,
              asBlack: drawn.asBlack,
              asWhite: drawn.asWhite,
            },
            all: {
              total: all.total,
              asBlack: all.asBlack,
              asWhite: all.asWhite,
            },
          },
          friend: friend &&
            friend.relation && {
              status:
                friend.relation === "confirmed"
                  ? "confirmed"
                  : friend.relation === "requestIncoming"
                    ? "request_incoming"
                    : friend.relation === "requestOutgoing"
                      ? "request_outgoing"
                      : "none",
            },
        },
      });
    }
  }, [loadProfileInformationQuery.data]);

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
