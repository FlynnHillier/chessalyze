"use client";

import { BsFillPeopleFill } from "react-icons/bs";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { RiUserSearchLine, RiUserShared2Line } from "react-icons/ri";
import { cn } from "~/lib/util/cn";
import { trpc } from "~/app/_trpc/client";
import { ComponentProps, CompositionEvent, useEffect, useState } from "react";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { GenericModal } from "~/app/_components/modal/modals";
import { useTimeout } from "usehooks-ts";
import { useSession } from "~/app/_components/providers/client/session.provider";

import { LuCopyCheck, LuCopy } from "react-icons/lu";
import { ClassNameValue } from "tailwind-merge";
import { ViewAllConfirmedFriends } from "../_components/friends.view";
import { SocialInteractionButton } from "../_components/SocialInteraction";
import { clearBrowserURLHash } from "~/app/_functions.tsx/navigation";
import { SocialTemplateLayout } from "../_components/social.layout";

// Strings to be used in hash section of URL
const HASH_STRINGS = {
  INVITE_FRIEND_BY_ID: "#add",
} as const satisfies Record<string, `${"#"}${string}`>;

/**
 * A text field to allowing users to copy its contents
 */
function CopyField({
  textToCopy,
  className,
}: {
  textToCopy: string;
  className?: ClassNameValue;
}) {
  const [revertToCopyIconTimeout, setRevertToCopyIconTimeout] = useState<
    null | number
  >(null);

  async function onClick() {
    await navigator.clipboard.writeText(textToCopy);

    setRevertToCopyIconTimeout(30 * 1000);
  }

  useTimeout(() => {
    setRevertToCopyIconTimeout(null);
  }, revertToCopyIconTimeout);

  return (
    <div
      className={cn(
        "flex w-1/2 cursor-pointer flex-row flex-nowrap items-center justify-center gap-1 rounded border  border-stone-100 px-5 py-1 text-center shadow-inner shadow-stone-700",
        className,
      )}
      onClick={onClick}
    >
      {!revertToCopyIconTimeout ? <LuCopy /> : <LuCopyCheck />}
      {textToCopy}
    </div>
  );
}

/**
 * A modal to allow users to search for and add friends using their ID
 */
function AddFriendByIDModal({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: () => any;
}) {
  const { user } = useSession();

  const TIME_AFTER_INPUT_TO_QUERY: number = 1500;

  const { showGlobalError } = useGlobalError();
  const [friendID, setFriendID] = useState<string>("");
  const [timeUntilQueryFriendID, setTimeUntilQueryFriendID] = useState<
    number | null
  >(null);

  const [isAwaitingFetch, setIsAwaitingFetch] = useState<boolean>(false);

  const profileQueryMutation = trpc.social.profile.user.target.useQuery(
    { targetUserID: friendID },
    {
      enabled: Boolean(friendID && timeUntilQueryFriendID === null),
    },
  );

  useEffect(() => {
    setIsAwaitingFetch(
      profileQueryMutation.isFetching || !!timeUntilQueryFriendID,
    );
  }, [profileQueryMutation.isFetching, timeUntilQueryFriendID]);

  useTimeout(() => {
    setTimeUntilQueryFriendID(null);
  }, timeUntilQueryFriendID);

  function PendingProfilePill() {
    return (
      <div className="flex h-full flex-col items-center gap-2">
        <div className="flex h-24 w-3/4 min-w-fit flex-row flex-nowrap justify-center gap-1 rounded p-2.5">
          <div
            className={cn(
              "box-border aspect-square h-full overflow-hidden rounded bg-stone-600",
              {
                "animate-pulse": isAwaitingFetch,
              },
            )}
          >
            {profileQueryMutation.data?.profile && !isAwaitingFetch && (
              <img
                className="bg-cover"
                src={
                  profileQueryMutation.data.profile?.user.imageURL
                    ? resizeGoogleProfilePictureURL(
                        profileQueryMutation.data.profile?.user.imageURL,
                        200,
                      )
                    : "/blankuser.png"
                }
              />
            )}
          </div>
          <div
            className={cn(
              "h-8 w-32 text-nowrap rounded text-start text-xl font-semibold ",
              {
                "animate-pulse": isAwaitingFetch,
                "bg-stone-600": !profileQueryMutation.data || isAwaitingFetch,
              },
            )}
          >
            {!isAwaitingFetch &&
              profileQueryMutation.data?.profile?.user.username}
          </div>
        </div>
        {profileQueryMutation.data?.profile && !isAwaitingFetch && (
          <SocialInteractionButton target={{ id: friendID }} />
        )}
      </div>
    );
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onRequestClose={close}
      header="Add friend"
      onAfterClose={clearBrowserURLHash}
      onAfterOpen={() => {
        window.location.hash = HASH_STRINGS.INVITE_FRIEND_BY_ID;
      }}
    >
      <div className="box-border flex h-full flex-col flex-nowrap items-center gap-2 pt-4 text-center">
        <input
          className="w-3/4 rounded border-none bg-stone-900 p-2 text-lg placeholder-stone-500 caret-stone-300 shadow-inner shadow-stone-800 focus:shadow-stone-600 focus:outline-none"
          value={friendID}
          onBeforeInput={(e) => {
            const event = e as unknown as CompositionEvent;
            if (!new RegExp("^[A-Za-z0-9]+$").test(event.data)) {
              showGlobalError("only alphanumeric characters are allowed", 6000);
              e.preventDefault();
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            setFriendID(target.value);
            setTimeUntilQueryFriendID(TIME_AFTER_INPUT_TO_QUERY);
          }}
          placeholder="Search by friend ID"
        />

        {(profileQueryMutation.data?.profile || isAwaitingFetch) &&
        friendID !== "" &&
        friendID !== undefined ? (
          <PendingProfilePill />
        ) : (
          friendID && (
            <span className="text-balance font-semibold ">
              We couldn't find that user, are you sure you've entered your
              friend's ID correctly?
            </span>
          )
        )}
        {user && (
          <div className="mb-5 mt-auto flex h-12 w-full flex-col items-center gap-1.5 justify-self-end text-balance font-semibold text-stone-400">
            want to share your ID?
            <CopyField textToCopy={user.id} className="text-stone-200" />
          </div>
        )}
      </div>
    </GenericModal>
  );
}

function SocialButton({
  className,
  children,
  ...otherProps
}: {} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...otherProps}
      className={cn(
        "flex flex-row flex-nowrap items-center gap-2 text-nowrap rounded bg-stone-700 p-3 text-lg font-semibold tracking-wide hover:bg-stone-600",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ShareOwnProfileButton({}) {
  return (
    <SocialButton>
      <RiUserShared2Line />
      Share profile
    </SocialButton>
  );
}

function AddFriendByIDButton({ onClick }: ComponentProps<"button">) {
  return (
    <SocialButton onClick={onClick}>
      <RiUserSearchLine />
      Add friend
    </SocialButton>
  );
}

export default function SocialOwnProfilePage() {
  const [showAddFriendByIDModal, setShowAddFriendByIDModal] =
    useState<boolean>(false);

  return (
    <>
      <AddFriendByIDModal
        isOpen={showAddFriendByIDModal}
        close={() => setShowAddFriendByIDModal(false)}
      />
      <SocialTemplateLayout
        header={
          <>
            <BsFillPeopleFill /> Social
          </>
        }
      >
        <div className="flex w-full flex-grow flex-col">
          <div className="m-3 flex flex-row gap-3">
            <AddFriendByIDButton
              onClick={() => {
                setShowAddFriendByIDModal(true);
              }}
            />
          </div>

          <ViewAllConfirmedFriends />
        </div>
      </SocialTemplateLayout>
    </>
  );
}
