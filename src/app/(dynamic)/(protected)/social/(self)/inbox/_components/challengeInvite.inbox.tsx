import {
  InboxedNotificationCardContainer,
  InboxedNotificationCardUserBanner,
} from "./notifications.layout";
import { SocialUser } from "~/types/social.types";
import { useRouter } from "next/navigation";

export function IncomingChallengeInvitationInboxedNotificationCard({
  user,
  lobbyID,
}: {
  lobbyID: string;
  user: SocialUser;
}) {
  const router = useRouter();

  return (
    <InboxedNotificationCardContainer header="Incoming challenge invite">
      <div className="flex w-full flex-row justify-between">
        <InboxedNotificationCardUserBanner user={user} />
        <button
          className="rounded bg-green-700 p-2 font-semibold"
          onClick={() => {
            router.push(`/play/join?challenge=${lobbyID}`);
          }}
        >
          view
        </button>
      </div>
    </InboxedNotificationCardContainer>
  );
}
