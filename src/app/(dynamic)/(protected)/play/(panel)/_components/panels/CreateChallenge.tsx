"use client";

import { useEffect, useState, useRef, useMemo, ReactNode } from "react";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { LuCopyCheck, LuCopy } from "react-icons/lu";

import { trpc } from "~/app/_trpc/client";
import { useLobby } from "~/app/_components/providers/client/lobby.provider";
import AsyncButton from "~/app/_components/common/buttons/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";

import { useChallengeConfiguration } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

import LobbyConfigurationInterface from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyConfiguration";
import { cn } from "~/lib/util/cn";
import { ClassNameValue } from "tailwind-merge";

import { HiOutlineLockOpen, HiOutlineLockClosed } from "react-icons/hi";
import { FaCross, FaPlus } from "react-icons/fa";
import { LuMailPlus, LuMailX, LuMailCheck } from "react-icons/lu";

import { useTimeout } from "usehooks-ts";
import { SocialUserSquaredProfilePicture } from "~/app/_components/social.components";
import { SocialUser, VerboseSocialUser } from "~/types/social.types";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { HashLoader, MoonLoader, PulseLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { useRouter } from "next/navigation";

function CreateLobbyButton() {
  const { show: showError } = useMutatePanelErrorMessage();
  const { challengeConfiguration, dispatchChallengeConfiguration } =
    useChallengeConfiguration();
  const { lobby, dispatchLobby } = useLobby();

  const createLobbyMutation = trpc.lobby.configure.create.useMutation({
    onError(error, variables, context) {
      showError(error.message);
    },
    onSuccess(data) {
      dispatchLobby({
        type: "LOAD",
        payload: {
          present: true,
          lobby: data,
        },
      });
    },
  });

  function isLobbyConfigurationInvalid() {
    return (
      (challengeConfiguration.time.preference === "timed" &&
        !challengeConfiguration.time.preset) ||
      !challengeConfiguration.color.preference
    );
  }

  return (
    <AsyncButton
      isLoading={createLobbyMutation.isLoading}
      onLoading={<SyncLoader customTailwind="bg-stone-700" />}
      onClick={() => {
        if (isLobbyConfigurationInvalid())
          showError("Please choose atleast one option for all options!");
        else
          createLobbyMutation.mutate({
            color:
              challengeConfiguration.color.preference === "random"
                ? undefined
                : {
                    preference: challengeConfiguration.color.preference,
                  },
            time:
              challengeConfiguration.time.preference === "non-timed" ||
              !challengeConfiguration.time.preset
                ? undefined
                : {
                    template: challengeConfiguration.time.preset,
                  },
          });
      }}
      customTailwind={{
        enabled: "hover:bg-stone-600 bg-stone-700",
        disabled: "bg-stone-800  text-stone-500",
      }}
      disabled={
        lobby.lobby?.accessibility.isPublicLinkAllowed ||
        (challengeConfiguration.time.preference === "timed" &&
          !challengeConfiguration.time.preset) ||
        !challengeConfiguration.color.preference
      }
      className="flex h-full w-full flex-row items-center justify-center gap-1 text-wrap rounded px-3 py-2 text-lg font-semibold text-white"
    >
      <IoIosLink />
      create challenge
    </AsyncButton>
  );
}

function CancelLobbyButton({ className }: { className?: ClassNameValue }) {
  const { lobby, dispatchLobby } = useLobby();

  const cancelLobbyMutation = trpc.lobby.configure.disband.useMutation({
    onSuccess(data, variables, context) {
      if (data.success) {
        dispatchLobby({ type: "END", payload: {} });
      }
    },
  });

  return (
    <AsyncButton
      isLoading={cancelLobbyMutation.isLoading}
      onLoading={
        <div className="flex w-full flex-col justify-center font-semibold">
          {"cancelling challenge..."}
          <div className="w-full">
            <SyncLoader customTailwind="bg-stone-600" />
          </div>
        </div>
      }
      onClick={() => {
        cancelLobbyMutation.mutate();
      }}
      disabled={!lobby.present}
      className="flex w-full flex-row items-center justify-center gap-1 text-sm"
    >
      <MdCancel />
      Cancel challenge
    </AsyncButton>
  );
}

function ToggleLobbyLinkAccessibilityButton({
  className,
}: {
  className?: ClassNameValue;
}) {
  const { lobby, dispatchLobby } = useLobby();
  const { show: showError } = useMutatePanelErrorMessage();

  const setChallengeLinkAccessibilityPublicMutation =
    trpc.lobby.configure.link.enable.useMutation({
      onError(error, variables, context) {
        showError(error.message);
      },
      onSuccess(data) {
        dispatchLobby({
          type: "UPDATE",
          payload: data.snapshot,
        });
      },
    });

  const setChallengeLinkAccessibilityPrivateMutation =
    trpc.lobby.configure.link.disable.useMutation({
      onError(error, variables, context) {
        showError(error.message);
      },
      onSuccess(data) {
        dispatchLobby({
          type: "UPDATE",
          payload: data.snapshot,
        });
      },
    });

  function handleButtonClick() {
    if (!lobby.lobby) return;

    if (lobby.lobby.accessibility.isPublicLinkAllowed) {
      setChallengeLinkAccessibilityPrivateMutation.mutate();
    } else {
      setChallengeLinkAccessibilityPublicMutation.mutate();
    }
  }

  return (
    <AsyncButton
      isLoading={
        setChallengeLinkAccessibilityPrivateMutation.isLoading ||
        setChallengeLinkAccessibilityPublicMutation.isLoading
      }
      onLoading={<SyncLoader customTailwind="bg-stone-700" />}
      onClick={handleButtonClick}
      className={cn(
        "flex items-center justify-center rounded",
        {
          "bg-stone-600": !lobby.lobby?.accessibility.isPublicLinkAllowed,
          "bg-green-600": lobby.lobby?.accessibility.isPublicLinkAllowed,
        },
        className,
      )}
    >
      {lobby.lobby?.accessibility.isPublicLinkAllowed ? (
        <>
          <HiOutlineLockOpen />
          public
        </>
      ) : (
        <>
          <HiOutlineLockClosed />
          invite only
        </>
      )}
    </AsyncButton>
  );
}

function CopyChallengeLink({ className }: { className?: ClassNameValue }) {
  const { lobby } = useLobby();

  const [hasRecentlyCopiedChallengeLink, setHasRecentlyCopiedChallengeLink] =
    useState<boolean>(false);

  /**
   * When lobby ID changes - the user definitely has not copied the *current* lobby invite link
   */
  useEffect(() => {
    setHasRecentlyCopiedChallengeLink(false);
  }, [lobby.lobby?.id]);

  useTimeout(
    () => {
      setHasRecentlyCopiedChallengeLink(false);
    },
    hasRecentlyCopiedChallengeLink === false ? null : 1000 * 60,
  );

  /**
   * Generate and copy a link that will join other users to the users created lobby
   *
   */
  function copyChallengeLinkToClipboard() {
    if (lobby.lobby?.id) {
      navigator.clipboard.writeText(
        `${window.location.origin}/play/join?challenge=${lobby.lobby.id}`,
      );
      setHasRecentlyCopiedChallengeLink(true);
    }
  }

  return (
    <button
      onClick={copyChallengeLinkToClipboard}
      className={cn(
        "flex flex-row items-center justify-center gap-1 text-base hover:opacity-80",
        className,
      )}
    >
      {hasRecentlyCopiedChallengeLink ? <LuCopyCheck /> : <LuCopy />}
      copy challenge link
    </button>
  );
}

function ManageChallengeInviteToSocialUserButton({
  className,
  iconSize,
  user,
}: {
  className?: ClassNameValue;
  iconSize?: number;
  user: SocialUser;
}) {
  const { lobby, dispatchLobby } = useLobby();
  const { showGlobalError } = useGlobalError();

  const [userHasBeenInvited, setUserHasBeenInvited] = useState<boolean>(false);
  const [selfIsHovered, setSelfIsHovered] = useState<boolean>(false);

  const DEFAULT_ICON_SIZE = 21;
  const TOOLTIP_IDS = {
    INVITE_SEND: `TOOLTIP_SEND_CHALLENGE_INVITE:${user.id}`,
    INVITE_REVOKE: `TOOLTIP_REVOKE_CHALLENGE_INVITE:${user.id}`,
  };
  const TOOLTIP_SHOW_DELAY = 1000;

  useEffect(() => {
    setUserHasBeenInvited(
      !!lobby.lobby?.accessibility.invited.includes(user.id),
    );
  }, [user, lobby.lobby?.accessibility.invited]);

  const sendUserChallengeInviteMutation =
    trpc.lobby.configure.invite.send.useMutation({
      onSuccess({ snapshot }) {
        dispatchLobby({
          type: "UPDATE",
          payload: snapshot,
        });
      },
      onError({ message }) {
        showGlobalError(message);
      },
    });

  const revokeUserChallengeInviteMutation =
    trpc.lobby.configure.invite.revoke.useMutation({
      onSuccess({ snapshot }) {
        dispatchLobby({
          type: "UPDATE",
          payload: snapshot,
        });
      },
      onError({ message }) {
        showGlobalError(message);
      },
    });

  function handleButtonClick() {
    if (!userHasBeenInvited) {
      sendUserChallengeInviteMutation.mutate({ playerID: user.id });
    } else {
      revokeUserChallengeInviteMutation.mutate({ playerID: user.id });
    }
  }

  return (
    <>
      <Tooltip
        delayShow={TOOLTIP_SHOW_DELAY}
        content="un-invite"
        id={TOOLTIP_IDS.INVITE_REVOKE}
      />
      <Tooltip
        delayShow={TOOLTIP_SHOW_DELAY}
        content="invite"
        id={TOOLTIP_IDS.INVITE_SEND}
      />
      <AsyncButton
        isLoading={
          sendUserChallengeInviteMutation.isLoading ||
          revokeUserChallengeInviteMutation.isLoading
        }
        onLoading={
          <HashLoader size={iconSize ?? DEFAULT_ICON_SIZE} color="white" />
        }
        onMouseEnter={() => {
          // This check ensures that when user is sorted and pushed to top of view,
          // That the element is not still considered hovered if it has moved away from the users cursor
          if (lobby.lobby?.accessibility.invited.includes(user.id))
            setSelfIsHovered(true);
        }}
        onMouseLeave={() => {
          setSelfIsHovered(false);
        }}
        onClick={handleButtonClick}
        className={cn("rounded bg-stone-800 p-1", className)}
      >
        {!userHasBeenInvited ? (
          <LuMailPlus
            size={iconSize ?? DEFAULT_ICON_SIZE}
            data-tooltip-id={TOOLTIP_IDS.INVITE_SEND}
          />
        ) : selfIsHovered ? (
          <LuMailX
            size={iconSize ?? DEFAULT_ICON_SIZE}
            className=" fill-red-700 stroke-red-950"
            data-tooltip-id={TOOLTIP_IDS.INVITE_REVOKE}
          />
        ) : (
          <LuMailCheck
            size={iconSize ?? DEFAULT_ICON_SIZE}
            className=" fill-green-700 stroke-green-950"
          />
        )}
      </AsyncButton>
    </>
  );
}

function ConfigureSocialUserChallengeInviteCard({
  className,
  user,
}: {
  className?: ClassNameValue;
  user: SocialUser;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex h-10 w-full flex-shrink-0 flex-row items-center justify-between gap-1.5 rounded bg-stone-700 p-2",
        className,
      )}
    >
      <div
        className="flex w-fit flex-row gap-1 hover:cursor-pointer"
        onClick={() => {
          router.push(`/social/user/${user.id}`);
        }}
      >
        <SocialUserSquaredProfilePicture user={user} size={30} />
        <div className="flex-grow text-ellipsis text-start align-top text-base font-semibold">
          {user.username}
        </div>
      </div>

      <ManageChallengeInviteToSocialUserButton
        user={user}
        className={"bg-stone"}
      />
    </div>
  );
}

function MappedConfigureSocialUserChallengeInviteCard({
  users,
  className,
  showOnEmptyUsersArray,
}: {
  users?: SocialUser[];
  showOnEmptyUsersArray?: ReactNode;
  className: ClassNameValue;
}) {
  const { lobby } = useLobby();

  const usersSortedByInviteStatus = useMemo(() => {
    if (!users) return [];

    return users.sort((userA, userB) => {
      return (
        (lobby.lobby?.accessibility.invited.includes(userA.id) ? -1 : 0) +
        (lobby.lobby?.accessibility.invited.includes(userB.id) ? 1 : 0)
      );
    });
  }, [users, lobby.lobby?.accessibility.invited]);

  return (
    <div
      className={cn(
        "flex h-60 w-full flex-col flex-wrap justify-start gap-x-1 gap-y-1.5 overflow-auto scrollbar-hide",
        className,
      )}
    >
      {users === undefined ? (
        <div className="flex h-fit w-full justify-center">
          <HashLoader />
        </div>
      ) : (
        <>
          {usersSortedByInviteStatus.length === 0
            ? showOnEmptyUsersArray
            : usersSortedByInviteStatus.map((user) => (
                <ConfigureSocialUserChallengeInviteCard
                  user={user}
                  key={user.id}
                />
              ))}
        </>
      )}
    </div>
  );
}

function MappedConfigureFriendedSocialUserChallengeInviteCard({
  className,
  showOnEmptyUsersArray,
}: {
  className?: ClassNameValue;
  showOnEmptyUsersArray?: ReactNode;
}) {
  const getAllFriendsQuery =
    trpc.social.friend.getAllFriends.useQuery(undefined);

  return (
    <MappedConfigureSocialUserChallengeInviteCard
      users={getAllFriendsQuery.data?.map(({ user }) => user)}
      className={className}
      showOnEmptyUsersArray={showOnEmptyUsersArray}
    />
  );
}

/**
 * Interface to configure and create a lobby
 */
export function CreateAndConfigureLobbyInterface() {
  const { lobby, dispatchLobby } = useLobby();

  const elementBottomRef = useRef<HTMLSpanElement>(null);

  const { challengeConfiguration, dispatchChallengeConfiguration } =
    useChallengeConfiguration();

  useEffect(() => {
    //Scroll bottom of panel into view when lobby becomes present
    if (lobby.present) {
      elementBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lobby.present]);

  return (
    <div className="flex h-fit w-full flex-col gap-2 text-gray-100">
      <LobbyConfigurationInterface
        disabled={lobby.present}
        interactable={true}
        state={{
          color: {
            selection: challengeConfiguration.color.preference,
            onSelection: (selection) => {
              dispatchChallengeConfiguration({
                type: "COLOR",
                payload: {
                  color: {
                    preference: selection,
                  },
                },
              });
            },
          },
          timing: {
            preference: {
              selection: challengeConfiguration.time.preference,
              onSelection: (selection) => {
                dispatchChallengeConfiguration({
                  type: "TIME_PREFERENCE",
                  payload: {
                    time: {
                      preference: selection,
                    },
                  },
                });
              },
            },
            option: {
              selection: challengeConfiguration.time.preset,
              onSelection: (selection) => {
                dispatchChallengeConfiguration({
                  type: "TIME_OPTION",
                  payload: {
                    time: {
                      preset: selection,
                    },
                  },
                });
              },
            },
          },
        }}
      />

      {!lobby.present ? (
        <CreateLobbyButton />
      ) : (
        <>
          <MappedConfigureFriendedSocialUserChallengeInviteCard
            className={"border-y border-stone-700 px-1 py-2"}
            showOnEmptyUsersArray={
              <span>
                Add your friends to invite them directly. Add them{" "}
                <Link href={"/social#add"} className="underline">
                  here.
                </Link>
              </span>
            }
          />
          <ToggleLobbyLinkAccessibilityButton className={"p-2"} />
          <CopyChallengeLink />
          <CancelLobbyButton />
        </>
      )}

      <span ref={elementBottomRef} />
    </div>
  );
}
