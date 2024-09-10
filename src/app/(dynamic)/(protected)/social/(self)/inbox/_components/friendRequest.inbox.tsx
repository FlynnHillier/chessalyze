import AsyncButton from "~/app/_components/common/buttons/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import { trpc } from "~/app/_trpc/client";
import { SocialUser } from "~/types/social.types";
import {
  InboxedNotificationCardContainer,
  InboxedNotificationCardUserBanner,
} from "./notifications.layout";
import { useRouter } from "next/navigation";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";

function HandleIncomingFriendRequestButtons({
  requestIncomingFromID,
  onFriendRequestHandled,
}: {
  requestIncomingFromID: string;
  onFriendRequestHandled: (accepted: boolean) => any;
}) {
  const { showGlobalError } = useGlobalError();

  const rejectIncomingFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation({
      onSuccess(data, variables, context) {
        if (data.success) onFriendRequestHandled(false);
      },
      onError(error, variables, context) {
        showGlobalError(error.message);
      },
    });
  const acceptIncomingFriendRequestMutation =
    trpc.social.friend.request.acceptIncoming.useMutation({
      onSuccess(data, variables, context) {
        if (data.success) onFriendRequestHandled(true);
      },
      onError(error, variables, context) {
        showGlobalError(error.message);
      },
    });

  return (
    <div className="flex flex-row gap-2 text-sm font-semibold">
      <AsyncButton
        isLoading={acceptIncomingFriendRequestMutation.isLoading}
        disabled={
          acceptIncomingFriendRequestMutation.isLoading ||
          rejectIncomingFriendRequestMutation.isLoading
        }
        onLoading={<SyncLoader customTailwind="bg-green-700" />}
        onClick={() => {
          acceptIncomingFriendRequestMutation.mutate({
            targetUserID: requestIncomingFromID,
          });
        }}
        className="rounded bg-green-700 px-1.5"
      >
        accept
      </AsyncButton>
      <AsyncButton
        isLoading={rejectIncomingFriendRequestMutation.isLoading}
        disabled={
          acceptIncomingFriendRequestMutation.isLoading ||
          rejectIncomingFriendRequestMutation.isLoading
        }
        onLoading={<SyncLoader customTailwind="bg-red-700" />}
        onClick={() => {
          rejectIncomingFriendRequestMutation.mutate({
            targetUserID: requestIncomingFromID,
          });
        }}
        className="rounded bg-red-600 px-1.5 py-0.5"
      >
        reject
      </AsyncButton>
    </div>
  );
}

export function IncomingFriendRequestInboxedNotificationCard({
  user,
  onFriendRequestHandled,
}: {
  user: SocialUser;
  onFriendRequestHandled: (accepted: boolean) => any;
}) {
  const router = useRouter();

  return (
    <>
      <InboxedNotificationCardContainer header="Incoming friend request">
        <div className="flex w-full flex-row justify-between">
          <InboxedNotificationCardUserBanner user={user} />
          <HandleIncomingFriendRequestButtons
            requestIncomingFromID={user.id}
            onFriendRequestHandled={onFriendRequestHandled}
          />
        </div>
      </InboxedNotificationCardContainer>
    </>
  );
}
