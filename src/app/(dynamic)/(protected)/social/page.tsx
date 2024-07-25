"use client";

import { BsFillPeopleFill } from "react-icons/bs";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { FaChessBoard, FaUserXmark, FaLink } from "react-icons/fa6";
import { RiUserSearchLine, RiUserShared2Line } from "react-icons/ri";
import { cn } from "~/lib/util/cn";
import { Tooltip } from "react-tooltip";
import { trpc } from "~/app/_trpc/client";
import { ClipLoader, MoonLoader } from "react-spinners";
import { ComponentProps, CompositionEvent, useEffect, useState } from "react";
import { useDispatchProfile } from "./_components/profile.context";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { GenericModal } from "~/app/_components/modal/modals";
import { useTimeout } from "usehooks-ts";
import { SocialInteractionButton } from "./_components/SocialInteraction";
import { useSession } from "~/app/_components/providers/client/session.provider";

import { LuCopyCheck, LuCopy } from "react-icons/lu";
import { ClassNameValue } from "tailwind-merge";
import { useWebSocket } from "next-ws/client";

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
    <GenericModal isOpen={isOpen} onRequestClose={close} header="Add friend">
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
          placeholder="Your friend's ID"
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
      Add friend by ID
    </SocialButton>
  );
}

function ExistingFriendsView({
  className,
}: {
  className?: ComponentProps<"div">["className"];
}) {
  const ws = useWebSocket();
  const { showGlobalError } = useGlobalError();
  const [friends, setFriends] =
    useState<
      Record<
        string,
        { id: string; username: string; imageURL: string | undefined }
      >
    >();

  const removeConfirmedFriendMutation =
    trpc.social.friend.request.remove.useMutation({
      onError(error, variables, context) {
        showGlobalError(error.message);
      },
    });
  const queryConfirmedFriends = trpc.social.friend.getAllFriends.useQuery(
    undefined,
    {
      onSettled(data, error) {
        if (data) {
          setFriends(
            data.reduce(
              (acc, { id, image, name }) => ({
                ...acc,
                [id]: {
                  id,
                  imageURL: image,
                  username: name,
                },
              }),
              {},
            ),
          );
        }
      },
    },
  );

  // useEffect(() => {
  //   wsServerToClientMessage.receiver({
  //     SOCIAL_PERSONAL_UPDATE:()
  //   })

  // },[ws])

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
            "flex h-fit flex-row flex-wrap items-start gap-3 overflow-y-auto px-3 pb-5",
          )}
        >
          {friends === undefined || queryConfirmedFriends.isLoading ? (
            <MoonLoader />
          ) : queryConfirmedFriends.isError ? (
            "something went wrong"
          ) : Object.keys(friends).length === 0 ? (
            "no friends to see here. try adding some."
          ) : (
            Object.values(friends).map(({ id, imageURL, username }) => {
              const ToolTipID = {
                CHALLENGE: "tooltip-challenge-friend-" + id,
                REMOVE_FRIEND: "tooltip-remove-friend-" + id,
              };

              return (
                <>
                  <Tooltip id={ToolTipID.CHALLENGE} content="challenge" />
                  <Tooltip
                    id={ToolTipID.REMOVE_FRIEND}
                    content="remove friend"
                  />
                  <div className="flex h-20 w-full min-w-64 flex-row  flex-nowrap justify-start gap-2 rounded p-2 shadow-lg shadow-stone-900 hover:bg-stone-900 lg:w-[calc(50%-(0.75rem/2))]  xl:w-[calc(32.8%-0.25rem)]  ">
                    <div className="relative aspect-square w-16 flex-shrink-0">
                      <img
                        className="left-0 top-0 h-full w-full overflow-hidden rounded bg-cover"
                        alt={`${username}'s profile picture`}
                        src={
                          imageURL
                            ? resizeGoogleProfilePictureURL(imageURL, 100)
                            : "/blankuser.png"
                        }
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 z-[0] inline-block aspect-square w-5 rounded-full",
                          { "bg-green-600": true, "bg-red-700": true },
                        )}
                      />
                    </div>
                    <div className="flex flex-grow flex-col justify-between overflow-hidden whitespace-nowrap">
                      <span className="inline-block text-ellipsis whitespace-nowrap text-xl font-semibold">
                        {username}
                      </span>
                      <div className="flex h-1/2 flex-row flex-nowrap items-start gap-1.5 text-xl">
                        <button
                          className="border-none"
                          onClick={() => {}}
                          disabled={removeConfirmedFriendMutation.isLoading}
                        >
                          {false ? (
                            <ClipLoader size={5} />
                          ) : (
                            <FaChessBoard
                              data-tooltip-id={ToolTipID.CHALLENGE}
                            />
                          )}
                        </button>

                        <button
                          onClick={() => {
                            removeConfirmedFriendMutation.mutate({
                              targetUserID: id,
                            });
                          }}
                          disabled={removeConfirmedFriendMutation.isLoading}
                          data-tooltip-id={ToolTipID.REMOVE_FRIEND}
                        >
                          {removeConfirmedFriendMutation.isLoading ? (
                            <ClipLoader size={20} color="gray" />
                          ) : (
                            <FaUserXmark />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { showGlobalError } = useGlobalError();
  const dispatchProfile = useDispatchProfile();
  const ownProfileQuery = trpc.social.profile.user.self.useQuery();

  const [showAddFriendByIDModal, setShowAddFriendByIDModal] =
    useState<boolean>(false);

  /**
   * Clear previously loaded profile
   */
  useEffect(() => {
    dispatchProfile({
      type: "CLEAR_LOADED_PROFILE",
      payload: {},
    });
  }, []);

  /**
   * Load own profile into context
   */
  useEffect(() => {
    if (ownProfileQuery.data) {
      const { profile } = ownProfileQuery.data;

      if (!profile) {
        showGlobalError("user does not exist", 1000 * 60);
        return;
      }

      dispatchProfile({
        type: "LOAD_PROFILE",
        payload: {
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
          activity: {
            status: {
              isOnline: profile.activity.isOnline,
              messages: {
                primary: profile.activity.messages.primary,
                secondary: profile.activity.messages.secondary,
              },
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
        },
      });
    }
  }, [ownProfileQuery.dataUpdatedAt]);

  return (
    <>
      <AddFriendByIDModal
        isOpen={showAddFriendByIDModal}
        close={() => setShowAddFriendByIDModal(false)}
      />

      <div className="flex flex-grow flex-col gap-1 ">
        <div className="flex flex-row flex-nowrap items-center gap-2 bg-stone-800 px-3 pb-3 pt-3 text-3xl font-bold tracking-wide shadow-2xl">
          <BsFillPeopleFill /> Social
        </div>
        <div className="flex w-full flex-grow flex-col">
          <div className="m-3 flex flex-row gap-3">
            <ShareOwnProfileButton />
            <AddFriendByIDButton
              onClick={() => {
                setShowAddFriendByIDModal(true);
              }}
            />
          </div>

          <ExistingFriendsView />
        </div>
      </div>
    </>
  );
}
