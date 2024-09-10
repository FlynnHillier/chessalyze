"use client";

import { SocialTemplateLayout } from "../../_components/social.layout";
import { RiInbox2Fill } from "react-icons/ri";
import { IncomingFriendRequestInboxedNotificationCard } from "./_components/friendRequest.inbox";
import { IncomingChallengeInvitationInboxedNotificationCard } from "./_components/challengeInvite.inbox";
import {
  useDispatchNotifcations,
  useNotifcations,
} from "~/app/_components/providers/client/notifications.provider";
import { toast } from "react-toastify";
import { TOAST_ID_FRIEND_REQUEST } from "~/app/_components/notifications/friend.notifications";
import SyncLoader from "~/app/_components/loading/SyncLoader";

export default function NotificationsInboxPage() {
  const notifications = useNotifcations();
  const dispatchNotifications = useDispatchNotifcations();

  function onFriendRequestHandled(accepted: boolean, userID: string) {
    dispatchNotifications({
      type: "INCOMING_FRIEND_REQUEST_ENDED",
      payload: userID,
    });
    toast.dismiss(TOAST_ID_FRIEND_REQUEST(userID));
  }

  return (
    <SocialTemplateLayout
      header={
        <>
          <RiInbox2Fill /> Inbox
        </>
      }
    >
      <div className="flex flex-col flex-wrap gap-2 p-2 font-semibold">
        {notifications.challenge.incoming?.map((lobby) => (
          <IncomingChallengeInvitationInboxedNotificationCard
            key={lobby.id}
            user={lobby.player}
            lobbyID={lobby.id}
          />
        ))}
        {notifications.friendRequest.incoming?.map((user) => (
          <IncomingFriendRequestInboxedNotificationCard
            onFriendRequestHandled={(accepted) => {
              onFriendRequestHandled(accepted, user.id);
            }}
            user={user}
            key={user.id}
          />
        ))}
        {notifications.friendRequest.incoming === undefined ||
        notifications.challenge.incoming === undefined ? (
          <SyncLoader customTailwind="bg-stone-700" />
        ) : notifications.friendRequest.incoming.length +
            notifications.challenge.incoming.length ===
          0 ? (
          "Your inbox is empty, come check back later."
        ) : null}
      </div>
    </SocialTemplateLayout>
  );
}
