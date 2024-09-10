import { useNotifcations } from "~/app/_components/providers/client/notifications.provider";
import {
  CommonConfigureSocialUserCard,
  CommonMappedSocialUserCardContainer,
} from "./_common";
import { useRouter } from "next/navigation";
import { NonVerboseLobbySnapshot } from "~/types/lobby.types";
import SyncLoader from "~/app/_components/loading/SyncLoader";

function IncomingChallengeSocialUserCard({
  lobby,
}: {
  lobby: NonVerboseLobbySnapshot;
}) {
  const router = useRouter();

  return (
    <CommonConfigureSocialUserCard user={lobby.player}>
      <button
        className="rounded bg-green-700 px-1.5 py-0.5 font-semibold"
        onClick={() => {
          router.push(`/play/join?challenge=${lobby.id}`);
        }}
      >
        view
      </button>
    </CommonConfigureSocialUserCard>
  );
}

export function JoinChallengeInterface() {
  const notifications = useNotifcations();

  return (
    <div className="flex h-fit w-full flex-col gap-2 text-gray-100">
      <CommonMappedSocialUserCardContainer>
        {notifications.challenge.incoming?.map((lobby) => (
          <IncomingChallengeSocialUserCard lobby={lobby} key={lobby.id} />
        ))}
        {notifications.challenge.incoming === undefined && (
          <SyncLoader customTailwind="bg-stone-700" />
        )}
        {notifications.challenge.incoming?.length === 0 &&
          "You haven't currently recieved any incoming game invites."}
      </CommonMappedSocialUserCardContainer>
    </div>
  );
}
