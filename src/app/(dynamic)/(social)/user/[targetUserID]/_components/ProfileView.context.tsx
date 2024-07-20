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
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { trpc } from "~/app/_trpc/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
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
      messages: {
        primary?: string;
        secondary?: string;
      };
    };
  };
};

type ProfileContext = { profile?: ProfileData };

type ProfileReducerAction =
  | ReducerAction<
      "FRIEND_STATUS_CHANGE",
      {
        status: Exclude<ProfileData["friend"], undefined>["status"];
      }
    >
  | ReducerAction<"INITIAL_LOAD", { profile: ProfileData | undefined }>
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
    case "INITIAL_LOAD": {
      return {
        profile: payload.profile,
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
export function ProfileViewProvider({
  children,
  target,
}: {
  children: ReactNode;
  target: { id: string };
}) {
  const ws = useWebSocket();
  const router = useRouter();
  const { showGlobalError } = useGlobalError();
  const loadProfileInformationQuery = trpc.social.profile.user.useQuery({
    targetUserID: target.id,
  });

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
        "PROFILE_VIEW:ACTIVITY_STATUS_UPDATE": ({ playerID, status }) => {
          if (playerID === target.id) {
            dispatchProfile({
              type: "ACTIVITY_STATUS_CHANGE",
              payload: {
                isOnline: status.isOnline,
                messages: {
                  primary: status.messages.primary,
                  secondary: status.messages.secondary,
                },
              },
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
      if (
        !loadProfileInformationQuery.data.exists ||
        !loadProfileInformationQuery.data.profile
      ) {
        showGlobalError("No such user exists");
        router.push("/social");
      }

      const { profile, exists } = loadProfileInformationQuery.data;
      dispatchProfile({
        type: "INITIAL_LOAD",
        payload: {
          profile:
            !exists || !profile
              ? undefined
              : {
                  user: {
                    id: profile.user.id,
                    imageURL: profile.user.imageURL,
                    username: profile.user.username,
                  },
                  stats: {
                    won: {
                      total: profile.stats.games.won.total,
                      asBlack: profile.stats.games.won.asBlack,
                      asWhite: profile.stats.games.won.asWhite,
                    },
                    lost: {
                      total: profile.stats.games.lost.total,
                      asBlack: profile.stats.games.lost.asBlack,
                      asWhite: profile.stats.games.lost.asWhite,
                    },
                    drawn: {
                      total: profile.stats.games.drawn.total,
                      asBlack: profile.stats.games.drawn.asBlack,
                      asWhite: profile.stats.games.drawn.asWhite,
                    },
                    all: {
                      total: profile.stats.games.all.total,
                      asBlack: profile.stats.games.all.asBlack,
                      asWhite: profile.stats.games.all.asWhite,
                    },
                  },
                  friend: profile.friend &&
                    profile.friend.relation && {
                      status:
                        profile.friend.relation === "confirmed"
                          ? "confirmed"
                          : profile.friend.relation === "requestIncoming"
                            ? "request_incoming"
                            : profile.friend.relation === "requestOutgoing"
                              ? "request_outgoing"
                              : "none",
                    },
                  activity: {
                    status: {
                      isOnline: profile.activity.isOnline,
                      messages: {
                        primary: profile.activity.messages.primary,
                        secondary: profile.activity.messages.secondary,
                      },
                    },
                  },
                },
        },
      });
    }
  }, [loadProfileInformationQuery.data]);

  useEffect(() => {
    if (loadProfileInformationQuery.error)
      showGlobalError(loadProfileInformationQuery.error.message);
  }, [loadProfileInformationQuery.errorUpdatedAt]);

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
