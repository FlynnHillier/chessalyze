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
import { toast, ToastContainer } from "react-toastify";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

import "react-toastify/dist/ReactToastify.css";
import "~/styles/toastify.override.css";
import {
  RecievedInviteLobbyNotification,
  TOAST_ID_LOBBY_INV,
} from "../../notifications/lobby.notifications";
import { NotificationInboxIcon } from "../../notifications/inbox.notifications";
import { SocialUser } from "~/types/social.types";
import { ReducerAction } from "~/types/util/context.types";
import { NonVerboseLobbySnapshot } from "~/types/lobby.types";
import { trpc } from "~/app/_trpc/client";
import {
  RecievedFriendRequestNotification,
  TOAST_ID_FRIEND_REQUEST,
} from "../../notifications/friend.notifications";

const DEFAULT_NOTIFICATION_AUTOCLOSE = 1000 * 5;

export type NOTIFICATIONSCONTEXT_DATA_TYPE = {
  friendRequest: {
    incoming?: SocialUser[];
  };
  challenge: {
    incoming?: NonVerboseLobbySnapshot[];
  };
};

const defaultContext: NOTIFICATIONSCONTEXT_DATA_TYPE = {
  friendRequest: {},
  challenge: {},
};

type NotificationReducerAction =
  | ReducerAction<"LOAD", Partial<NOTIFICATIONSCONTEXT_DATA_TYPE>>
  | ReducerAction<"INCOMING_FRIEND_REQUEST", SocialUser[]>
  | ReducerAction<"INCOMING_FRIEND_REQUEST_ENDED", string>
  | ReducerAction<
      "INCOMING_CHALLENGE",
      NonNullable<NOTIFICATIONSCONTEXT_DATA_TYPE["challenge"]["incoming"]>
    >
  | ReducerAction<"INCOMING_CHALLENGE_ENDED", string>;

function reducer<A extends NotificationReducerAction>(
  state: NOTIFICATIONSCONTEXT_DATA_TYPE,
  action: A,
): NOTIFICATIONSCONTEXT_DATA_TYPE {
  const { type, payload } = action;

  switch (type) {
    case "LOAD": {
      return {
        ...state,
        challenge: payload.challenge ?? state.challenge,
        friendRequest: payload.friendRequest ?? state.friendRequest,
      };
    }
    case "INCOMING_FRIEND_REQUEST_ENDED": {
      if (!state.friendRequest.incoming) return state;

      const i = state.friendRequest.incoming?.findIndex(
        (user) => user.id === payload,
      );

      if (i === -1 || i === undefined) return state;

      toast.dismiss(TOAST_ID_FRIEND_REQUEST(payload));

      return {
        ...state,
        friendRequest: {
          ...state.friendRequest,
          incoming:
            i === 0
              ? []
              : [
                  ...state.friendRequest.incoming.slice(0, i),
                  ...state.friendRequest.incoming.slice(i + 1),
                ],
        },
      };
    }
    case "INCOMING_CHALLENGE_ENDED": {
      if (!state.challenge.incoming) return state;

      const i = state.challenge.incoming?.findIndex(
        (lobby) => lobby.id === payload,
      );

      if (i === -1 || i === undefined) return state;

      toast.dismiss(TOAST_ID_LOBBY_INV(payload));

      return {
        ...state,
        challenge: {
          ...state.challenge,
          incoming:
            i === 0
              ? []
              : [
                  ...state.challenge.incoming.slice(0, i),
                  ...state.challenge.incoming.slice(i + 1),
                ],
        },
      };
    }
    case "INCOMING_CHALLENGE": {
      const newChallengeInvites = payload.filter(
        ({ id }) =>
          !state.challenge.incoming?.find(
            ({ id: inStateID }) => inStateID === id,
          ),
      );

      newChallengeInvites.forEach((lobby) => {
        toast(
          <RecievedInviteLobbyNotification from={lobby.player} lobby={lobby} />,
          {
            autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE,
            toastId: TOAST_ID_LOBBY_INV(lobby.id),
          },
        );
      });

      return {
        ...state,
        challenge: {
          ...state.challenge,
          incoming: [
            ...(state.challenge.incoming ?? []),
            ...newChallengeInvites,
          ],
        },
      };
    }
    case "INCOMING_FRIEND_REQUEST": {
      const newFriendRequests = payload.filter(
        ({ id }) =>
          !state.friendRequest.incoming?.find(
            ({ id: inStateID }) => inStateID === id,
          ),
      );

      newFriendRequests.forEach((user) => {
        toast(<RecievedFriendRequestNotification from={user} key={user.id} />, {
          autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE,
          toastId: TOAST_ID_FRIEND_REQUEST(user.id),
        });
      });

      return {
        ...state,
        friendRequest: {
          ...state.friendRequest,
          incoming: [...(state.friendRequest.incoming ?? []), ...payload],
        },
      };
    }
    default:
      return { ...state };
  }
}

const NotificationContext = createContext(
  {} as {
    notifications: NOTIFICATIONSCONTEXT_DATA_TYPE;
    dispatchNotifications: Dispatch<NotificationReducerAction>;
  },
);

export function useNotifcations() {
  return useContext(NotificationContext).notifications;
}

export function useDispatchNotifcations() {
  return useContext(NotificationContext).dispatchNotifications;
}

export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, dispatchNotifications] = useReducer(
    reducer,
    defaultContext,
  );

  /**
   * Fetch initial notifications
   */
  const queryIncomingChallenges = trpc.lobby.invites.incoming.useQuery(
    undefined,
    {
      onSuccess(data) {
        dispatchNotifications({
          type: "INCOMING_CHALLENGE",
          payload: data,
        });
      },
    },
  );

  /**
   * Fetch initial notifications
   */
  const queryIncomingFriendRequests =
    trpc.social.friend.getAllIncomingFriendRequests.useQuery(undefined, {
      onSuccess(data) {
        dispatchNotifications({
          type: "LOAD",
          payload: {
            friendRequest: {
              incoming: data,
            },
          },
        });
      },
    });

  /**
   * Subscribe to websocket events to live update notifications.
   */
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    function onWsMessageEvent(e: MessageEvent) {
      wsServerToClientMessage.receiver({
        "LOBBY:INVITE_RECEIVED": ({ lobbyPreview, user }) => {
          dispatchNotifications({
            type: "INCOMING_CHALLENGE",
            payload: [lobbyPreview],
          });
        },
        "SOCIAL:INCOMING_FRIEND_REQUEST": (user) => {
          dispatchNotifications({
            type: "INCOMING_FRIEND_REQUEST",
            payload: [user],
          });
        },
        "LOBBY:INVITE_REVOKED": ({ lobbyID }) => {
          dispatchNotifications({
            type: "INCOMING_CHALLENGE_ENDED",
            payload: lobbyID,
          });
        },
      })(e.data);
    }

    ws.addEventListener("message", onWsMessageEvent);

    return () => {
      ws.removeEventListener("message", onWsMessageEvent);
    };
  }, [ws]);

  return (
    <NotificationContext.Provider
      value={{ notifications, dispatchNotifications }}
    >
      <div className="relative h-full w-full">
        <NotificationInboxIcon className="absolute right-0 top-0" />
        <ToastContainer theme="dark" position="bottom-right" stacked={true} />
        {children}
      </div>
    </NotificationContext.Provider>
  );
}
