"use client";

import { useWebSocket } from "next-ws/client";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { ReducerAction } from "~/types/util/context.types";
import { trpc } from "~/app/_trpc/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

import {
  VerboseSocialUser,
  SocialUser,
  SocialActivity,
} from "~/types/social.types";

type FriendsContextType = {
  dispatchFriends: Dispatch<FriendReducerAction>;
  friends: Record<SocialUser["id"], VerboseSocialUser>;
  isLoading: boolean;
};

const FriendsContext = createContext<FriendsContextType>(
  {} as FriendsContextType,
);

type FriendReducerAction =
  | ReducerAction<"LOAD", FriendsContextType["friends"]>
  | ReducerAction<"REMOVE", { id: SocialUser["id"] }>
  | ReducerAction<"NEW", VerboseSocialUser>
  | ReducerAction<
      "UPDATE_ACTIVITY",
      { id: SocialUser["id"]; activity: SocialActivity }
    >;

function friendsContextReducer<A extends FriendReducerAction>(
  state: FriendsContextType["friends"],
  action: A,
): FriendsContextType["friends"] {
  const { type, payload } = action;

  switch (type) {
    case "LOAD": {
      return {
        ...payload,
      };
    }
    case "REMOVE": {
      delete state[payload.id];
      return {
        ...state,
      };
    }
    case "NEW": {
      return {
        ...state,
        [payload.user.id]: payload,
      };
    }
    case "UPDATE_ACTIVITY": {
      const target = state[payload.id];

      if (!target) {
        return { ...state };
      }

      return {
        ...state,
        [payload.id]: {
          ...target,
          activity: payload.activity,
        },
      };
    }
  }
}

export function useFriendsContext() {
  return useContext(FriendsContext);
}

export function FriendsProvider({ children }: { children: ReactNode }) {
  const ws = useWebSocket();

  const friendsQuery = trpc.social.friend.getAllFriends.useQuery(undefined, {
    onSettled(data, error) {
      console.log("loaded!", data);

      if (data) {
        dispatchFriends({
          type: "LOAD",
          payload: data.reduce(
            (acc, { user, activity }) => ({
              ...acc,
              [user.id]: {
                user,
                activity,
              },
            }),
            {},
          ),
        });
      }
    },
  });

  useEffect(() => {
    if (!ws) return;

    function onWSMessageEvent(e: MessageEvent) {
      wsServerToClientMessage.receiver({
        "SOCIAL:FRIEND_RELATION_UPDATE": ({ new_relation, targetUserID }) => {
          if (friends[targetUserID] && new_relation !== "confirmed") {
            dispatchFriends({
              type: "REMOVE",
              payload: {
                id: targetUserID,
              },
            });
          }
        },
        "SOCIAL:FRIEND_NEW": ({ user, activity }) => {
          dispatchFriends({
            type: "NEW",
            payload: { user, activity },
          });
        },
        "SOCIAL:FRIEND_ACTIVITY_UPDATE": ({ activity, targetUserID }) => {
          dispatchFriends({
            type: "UPDATE_ACTIVITY",
            payload: {
              id: targetUserID,
              activity: activity,
            },
          });
        },
      })(e.data);
    }

    ws.addEventListener("message", onWSMessageEvent);

    return () => {
      ws.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  const [friends, dispatchFriends] = useReducer(friendsContextReducer, {});

  return (
    <FriendsContext.Provider
      value={{
        dispatchFriends,
        friends,
        isLoading: friendsQuery.isLoading,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}
