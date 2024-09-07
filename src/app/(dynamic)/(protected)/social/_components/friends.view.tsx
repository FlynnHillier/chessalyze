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
import { VerboseSocialUserSquaredProfilePicture } from "~/app/_components/social.components";

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
      <div className="mb-1 flex w-full flex-shrink flex-grow-0 basis-auto text-nowrap px-3 text-2xl font-semibold">
        Friends
      </div>
      <hr className="mx-2 mb-2 border-stone-700"></hr>

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
    remove: "tooltip-social-remove_" + user.user.id,
  };

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
      <Tooltip
        id={TOOLTIP_ID.remove}
        content="remove friend"
        className="z-10"
      />
      <div className="flex h-20 w-full min-w-64 flex-row  flex-nowrap justify-start gap-2 rounded p-2 shadow-lg shadow-stone-900 hover:bg-stone-900 lg:w-[calc(50%-(0.75rem/2))]  xl:w-[calc(32.8%-0.25rem)]  ">
        <VerboseSocialUserSquaredProfilePicture verboseUser={user} size={60} />
        <div className="flex flex-grow flex-col justify-between overflow-hidden whitespace-nowrap">
          <span className="inline-block text-ellipsis whitespace-nowrap text-xl font-semibold">
            {user.user.username}
          </span>
          <div className="flex h-1/2 flex-row flex-nowrap items-start gap-1.5 text-xl">
            <RemoveFriendButton />
          </div>
        </div>
      </div>
    </>
  );
}
