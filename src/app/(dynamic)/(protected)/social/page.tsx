"use client";

import { BsFillPeopleFill } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { FaChessBoard, FaUserXmark } from "react-icons/fa6";
import { RiUserSearchLine, RiUserAddLine } from "react-icons/ri";
import { cn } from "~/lib/util/cn";
import { Tooltip } from "react-tooltip";
import { trpc } from "~/app/_trpc/client";
import { ClipLoader } from "react-spinners";
import { useEffect } from "react";
import { useDispatchProfile } from "./_components/profile.context";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";

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

function FriendLinkButton({}) {
  return (
    <SocialButton>
      <RiUserAddLine />
      Friend link
    </SocialButton>
  );
}

function AddFriendByIDButton({}) {
  return (
    <SocialButton>
      <RiUserSearchLine />
      Add friend by ID
    </SocialButton>
  );
}

function GameChallengeLinkButton() {
  return (
    <SocialButton>
      <FaLink />
      Challenge link
    </SocialButton>
  );
}

function FriendPill({
  user,
}: {
  user: { id: string; imageURL: string | null; username: string };
}) {
  const removeFriendMutation = trpc.social.friend.existing.remove.useMutation();
  const challengeFriendMutation = ""; //TODO

  const ToolTipID = {
    CHALLENGE: "tooltip-challenge-friend-" + user.id,
    REMOVE_FRIEND: "tooltip-remove-friend-" + user.id,
  };

  return (
    <>
      <Tooltip id={ToolTipID.CHALLENGE} content="challenge" className="z-30" />
      <Tooltip
        id={ToolTipID.REMOVE_FRIEND}
        content="remove friend"
        className="z-30"
      />
      <div className="h-18 flex w-64 flex-row flex-nowrap gap-2 rounded bg-inherit bg-stone-900  p-2">
        <div className="relative aspect-square w-16">
          <img
            className=" left-0 top-0 h-full w-full overflow-hidden rounded bg-cover"
            alt={`${user.username}'s profile picture`}
            src={
              user.imageURL
                ? resizeGoogleProfilePictureURL(user.imageURL, 100)
                : "/blankuser.png"
            }
          />
          <span
            className={cn(
              "absolute -bottom-1 -right-1 z-10 inline-block aspect-square w-5 rounded-full",
              { "bg-green-600": true, "bg-red-700": true },
            )}
          />
        </div>
        <div className="flex flex-col justify-between">
          <span className="text-xl font-semibold">{user.username}</span>
          <div className="flex h-1/2 flex-row flex-nowrap items-start gap-1.5 text-xl">
            <button
              onClick={() => {
                removeFriendMutation.mutate({ targetUserID: user.id });
              }}
              disabled={removeFriendMutation.isLoading}
              data-tooltip-id={ToolTipID.CHALLENGE}
            >
              {removeFriendMutation.isLoading ? (
                <ClipLoader size={20} color="gray" />
              ) : (
                <FaChessBoard />
              )}
            </button>
            <button
              className="border-none"
              onClick={() => {}}
              disabled={removeFriendMutation.isLoading}
            >
              {false ? (
                <ClipLoader size={5} />
              ) : (
                <FaUserXmark data-tooltip-id={ToolTipID.REMOVE_FRIEND} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SocialPage() {
  const { showGlobalError } = useGlobalError();
  const dispatchProfile = useDispatchProfile();
  const ownProfileQuery = trpc.social.profile.user.self.useQuery();

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
      <div className="mb-3 flex flex-row flex-nowrap items-center gap-2 bg-stone-800 px-3 pb-3 pt-3 text-3xl font-bold tracking-wide shadow-2xl">
        <BsFillPeopleFill /> Social
      </div>
      <div className="container h-full w-full p-3">
        <div className="flex flex-row gap-3">
          <FriendLinkButton />
          <AddFriendByIDButton />
          <GameChallengeLinkButton />
        </div>

        {/* <FriendPill
          user={{
            id: "123",
            imageURL:
              "https://lh3.googleusercontent.com/a/ACg8ocLc5Wkrdbp64B0ozgDG0bX3onu4z5T2F8HgMALKVC8KIKpWa6E9=s96-c",
            username: "user name",
          }}
        /> */}
      </div>
    </>
  );
}
