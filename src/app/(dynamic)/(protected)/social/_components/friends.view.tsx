import { trpc } from "~/app/_trpc/client";
import { cn } from "~/lib/util/cn";
import { ComponentProps, useState } from "react";
import { ClipLoader, MoonLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { FaUserXmark, FaChessBoard, FaC } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { useGame } from "~/app/_components/providers/client/game.provider";
import { toast } from "react-toastify";
import { useFriendsContext } from "~/app/_components/providers/client/friends.provider";
import { VerboseSocialUser } from "~/types/social.types";

export function ViewAllConfirmedFriends({
  className,
}: {
  className?: ComponentProps<"div">["className"];
}) {
  const { friends, isLoading } = useFriendsContext();

  return (
    <div
      className={cn(
        "flow flex h-full max-h-full w-full flex-col rounded",
        className,
      )}
    >
      <div className="mb-3 flex w-full flex-shrink flex-grow-0 basis-auto text-nowrap px-3 text-2xl font-semibold">
        Friends
      </div>

      <div className="flex flex-grow overflow-y-auto">
        <div
          className={cn(
            "flex h-fit w-full flex-row flex-wrap items-start gap-3 overflow-y-auto px-3 pb-5",
          )}
        >
          {isLoading ? (
            <div className="flex h-fit w-full flex-row items-center justify-center">
              <MoonLoader />
            </div>
          ) : Object.keys(friends).length === 0 ? (
            <div className="flex h-fit w-full flex-row items-center justify-start font-semibold">
              No friends to see here. Try adding some!
            </div>
          ) : (
            Object.values(friends).map((user) => (
              <ExistingFriendPill user={user} key={user.user.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExistingFriendPill({ user }: { user: VerboseSocialUser }) {
  const { dispatchFriends } = useFriendsContext();
  const { showGlobalError } = useGlobalError();

  const TOOLTIP_ID = {
    challenge: "tooltip-social-challenge_" + user.user.id,
    remove: "tooltip-social-remove_" + user.user.id,
  };

  function ChallengeInviteButton() {
    const { game } = useGame();
    const [hasSentInvite, setHasSentInvite] = useState<boolean>(false);

    const sendChallengeMutation = trpc.lobby.configure.invite.send.useMutation({
      onError(error, variables, context) {
        showGlobalError(error.message);
      },
      onSuccess(data, variables, context) {
        if (data.success) {
          setHasSentInvite(true);
          toast.success(`Game invite sent to ${user.user.username}`);
        }
      },
    });

    const revokeChallengeInviteMutation =
      trpc.lobby.configure.invite.revoke.useMutation({
        onError(error, variables, context) {
          showGlobalError(error.message);

          // if(error.)
        },
        onSuccess(data, variables, context) {
          if (data.success) {
            setHasSentInvite(true);
            toast.success(
              `successfully revoked invite for ${user.user.username}`,
            );
          }
        },
      });

    return (
      <button
        className="border-none"
        onClick={() => {
          sendChallengeMutation.mutate({ playerID: user.user.id });
        }}
        disabled={
          !!game?.live || sendChallengeMutation.isLoading || hasSentInvite
        }
      >
        {sendChallengeMutation.isLoading ? (
          <ClipLoader size={5} />
        ) : hasSentInvite ? (
          <FaCheck size={18} />
        ) : (
          <FaChessBoard data-tooltip-id={TOOLTIP_ID.challenge} />
        )}
      </button>
    );
  }

  function RemoveFriendButton() {
    const removeConfirmedFriendMutation =
      trpc.social.friend.request.remove.useMutation({
        onSettled(data, error, variables, context) {
          if (error) return showGlobalError(error.message);
          if (data) {
            if (data.success) {
              dispatchFriends({
                type: "REMOVE",
                payload: {
                  id: user.user.id,
                },
              });
            }
          }
        },
      });

    return (
      <button
        className="border-none"
        onClick={() => {
          removeConfirmedFriendMutation.mutate({ targetUserID: user.user.id });
        }}
        disabled={removeConfirmedFriendMutation.isLoading}
      >
        {removeConfirmedFriendMutation.isLoading ? (
          <ClipLoader size={5} />
        ) : (
          <FaUserXmark data-tooltip-id={TOOLTIP_ID.remove} />
        )}
      </button>
    );
  }

  return (
    <>
      <Tooltip id={TOOLTIP_ID.challenge} content="challenge" className="z-10" />
      <Tooltip
        id={TOOLTIP_ID.remove}
        content="remove friend"
        className="z-10"
      />
      <div className="flex h-20 w-full min-w-64 flex-row  flex-nowrap justify-start gap-2 rounded p-2 shadow-lg shadow-stone-900 hover:bg-stone-900 lg:w-[calc(50%-(0.75rem/2))]  xl:w-[calc(32.8%-0.25rem)]  ">
        <div className="relative aspect-square w-16 flex-shrink-0">
          <img
            className="left-0 top-0 h-full w-full overflow-hidden rounded bg-cover"
            alt={`${user.user.username}'s profile picture`}
            src={
              user.user.imageURL
                ? resizeGoogleProfilePictureURL(user.user.imageURL, 100)
                : "/blankuser.png"
            }
          />
          <span
            className={cn(
              "absolute -bottom-1 -right-1 z-[0] inline-block aspect-square w-5 rounded-full",
              {
                "bg-green-600": user.activity.isOnline,
                "bg-red-700": !user.activity.isOnline,
              },
            )}
          />
        </div>
        <div className="flex flex-grow flex-col justify-between overflow-hidden whitespace-nowrap">
          <span className="inline-block text-ellipsis whitespace-nowrap text-xl font-semibold">
            {user.user.username}
          </span>
          <div className="flex h-1/2 flex-row flex-nowrap items-start gap-1.5 text-xl">
            <RemoveFriendButton />
            <ChallengeInviteButton />
          </div>
        </div>
      </div>
    </>
  );
}
