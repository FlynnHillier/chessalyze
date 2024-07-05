"use client";

import { useEffect, useState } from "react";
import { trpc, TRPCAppClientError } from "~/app/_trpc/client";
import {
  FixedSizeAsyncButton,
  FixedSizeAsyncButtonRight,
} from "~/app/_components/common/buttons/AsyncButton";
import { ScaleLoader } from "react-spinners";
import {
  FaUserPlus,
  FaUserTimes,
  FaUserClock,
  FaUserCheck,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

import { IconType } from "react-icons/lib";
import { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

type ButtonCallbacks<T extends `on${Capitalize<string>}`> = Partial<
  Record<T, (success: boolean, error?: unknown) => any>
>;

/**
 *
 * Button that allows for social interaction with target user, displays the relevant button based on the user's current relation with
 */
export function FriendInteractionButton({
  target,
  onError,
}: {
  target: {
    id: string;
  };
  onError?: (e: unknown) => any;
}) {
  const friendRelationQuery = trpc.social.profile.friendRelation.useQuery({
    targetUserID: target.id,
  });
  const [currentFriendRelation, setCurrentFriendRelation] = useState<
    "confirmed" | "requestOutgoing" | "requestIncoming" | "none"
  >();

  useEffect(() => {
    if (friendRelationQuery.data)
      setCurrentFriendRelation(friendRelationQuery.data.relation);
  }, [friendRelationQuery.dataUpdatedAt]);

  /**
   * To be displayed while initial friend status is being loaded
   */
  function PlaceHolderLoadingButton() {
    return (
      <FixedSizeAsyncButton
        isLoading={true}
        onLoading={<ScaleLoader height={20} color="black" />}
        className={"rounded bg-stone-600 p-2 font-semibold"}
      />
    );
  }

  function onSendFriendRequest(success: boolean, error?: unknown) {
    if (success) setCurrentFriendRelation("requestOutgoing");
    else onError?.(error ?? new Error("failed to send friend request"));
  }

  function onCancelOutgoingFriendRequest(success: boolean, error?: unknown) {
    console.log(success);

    if (success) setCurrentFriendRelation("none");
    else onError?.(error ?? new Error("failed to cancel friend request"));
  }

  function onAcceptFriendRequest(success: boolean, error?: unknown) {
    if (success) setCurrentFriendRelation("confirmed");
    else onError?.(error ?? new Error("failed to accept friend request"));
  }

  function onRejectFriendRequest(success: boolean, error?: unknown) {
    if (success) setCurrentFriendRelation("none");
    else onError?.(error ?? new Error("failed to accept friend request"));
  }

  function onRemoveExistingFriend(success: boolean, error?: unknown) {
    if (success) setCurrentFriendRelation("none");
    else onError?.(error ?? new Error("failed to remove friend"));
  }

  return friendRelationQuery.isLoading ? (
    <PlaceHolderLoadingButton />
  ) : currentFriendRelation === "confirmed" ? (
    <HandleExistingFriendButton
      target={target}
      callbacks={{ onRemoveExistingFriend }}
    />
  ) : currentFriendRelation === "requestOutgoing" ? (
    <HandleOutgoingFriendRequestButton
      target={target}
      callbacks={{ onCancelOutgoingFriendRequest }}
    />
  ) : currentFriendRelation === "requestIncoming" ? (
    <HandleIncomingFriendRequest
      target={target}
      callbacks={{ onAcceptFriendRequest, onRejectFriendRequest }}
    />
  ) : currentFriendRelation === "none" ? (
    <SendFriendRequestButton
      target={target}
      callbacks={{ onSendFriendRequest }}
    />
  ) : (
    <>something went wrong</>
  );
}

function SocialButtonContent({
  Icon,
  text,
  children,
}: {
  Icon?: IconType;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-row flex-nowrap items-center gap-x-1 text-nowrap text-center">
      {Icon && <Icon size={20} />}
      {text}
      {children}
    </div>
  );
}

/**
 * Button that sends friend request to target user
 */
function SendFriendRequestButton({
  target,
  callbacks,
}: {
  target: {
    id: string;
  };
  callbacks?: ButtonCallbacks<"onSendFriendRequest">;
}) {
  const sendFriendRequestMutation =
    trpc.social.friend.request.send.useMutation();

  async function sendFriendRequest() {
    try {
      const response = await sendFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onSendFriendRequest?.(response.success);
    } catch (e) {
      callbacks?.onSendFriendRequest?.(false, e);
    }
  }

  return (
    <FixedSizeAsyncButton
      className={"rounded bg-stone-600 p-2 font-semibold"}
      onClick={sendFriendRequest}
      isLoading={sendFriendRequestMutation.isLoading}
      onLoading={<ScaleLoader height={20} color="black" />}
    >
      <SocialButtonContent Icon={FaUserPlus} text={"add friend"} />
    </FixedSizeAsyncButton>
  );
}

/**
 * Button that allows user to accept / reject incoming friend request from target user
 */
function HandleIncomingFriendRequest({
  target,
  callbacks,
}: {
  target: {
    id: string;
  };
  callbacks?: ButtonCallbacks<
    "onAcceptFriendRequest" | "onRejectFriendRequest"
  >;
}) {
  const acceptFriendRequestMutation =
    trpc.social.friend.request.acceptIncoming.useMutation();

  const rejectFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation();

  async function acceptFriendRequest() {
    try {
      const response = await acceptFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onAcceptFriendRequest?.(response.success);
    } catch (e) {
      callbacks?.onAcceptFriendRequest?.(false, e);
    }
  }

  async function rejectFriendRequest() {
    try {
      const response = await rejectFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onRejectFriendRequest?.(response.success);
    } catch (e) {
      callbacks?.onRejectFriendRequest?.(false, e);
    }
  }

  return (
    <div className="flex flex-row gap-1">
      <FixedSizeAsyncButton
        className="rounded bg-green-600 p-2 font-semibold"
        onClick={acceptFriendRequest}
        isLoading={acceptFriendRequestMutation.isLoading}
        disabled={rejectFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="green" />}
      >
        <SocialButtonContent Icon={FaUserPlus} text={"accept"} />
      </FixedSizeAsyncButton>
      <FixedSizeAsyncButton
        className="rounded bg-red-800 p-2 font-semibold"
        onClick={rejectFriendRequest}
        isLoading={rejectFriendRequestMutation.isLoading}
        disabled={acceptFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="red" />}
      >
        <SocialButtonContent Icon={FaUserTimes} text={"ignore"} />
      </FixedSizeAsyncButton>
    </div>
  );
}

/**
 * Button that allows user cancel outgoing friend request to target user
 */
function HandleOutgoingFriendRequestButton({
  target,
  callbacks,
}: {
  target: {
    id: string;
  };
  callbacks?: ButtonCallbacks<"onCancelOutgoingFriendRequest">;
}) {
  const TOOLTIP_ID = "social-cancel-outgoing-request-button";
  const cancelOutgoingFriendRequestMutation =
    trpc.social.friend.request.cancelOutgoing.useMutation();

  async function cancelOutgoingFriendRequest() {
    try {
      const response = await cancelOutgoingFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onCancelOutgoingFriendRequest?.(response.success);
    } catch (e) {
      callbacks?.onCancelOutgoingFriendRequest?.(false, e);
    }
  }

  return (
    <>
      <Tooltip id={TOOLTIP_ID} noArrow={true} style={{ padding: "2px" }} />
      <FixedSizeAsyncButtonRight
        isLoading={cancelOutgoingFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="green" />}
        buttonRight={
          <button
            onClick={cancelOutgoingFriendRequest}
            data-tooltip-id={TOOLTIP_ID}
            data-tooltip-content="cancel request"
          >
            <RxCross2 />
          </button>
        }
        className="rounded bg-green-600 p-2 font-semibold"
      >
        <FaUserClock />
        request sent
      </FixedSizeAsyncButtonRight>
    </>
  );
}

/**
 * Button that allows user to remove existing friendship with target user
 */
function HandleExistingFriendButton({
  target,
  callbacks,
}: {
  target: {
    id: string;
  };
  callbacks?: ButtonCallbacks<"onRemoveExistingFriend">;
}) {
  const TOOLTIP_ID = "social-remove-existing-friend-button";
  const cancelOutgoingFriendRequestMutation =
    trpc.social.friend.existing.remove.useMutation();

  async function removeExistingFriend() {
    try {
      const response = await cancelOutgoingFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onRemoveExistingFriend?.(response.success);
    } catch (e) {
      callbacks?.onRemoveExistingFriend?.(false, e);
    }
  }

  return (
    <>
      <Tooltip id={TOOLTIP_ID} noArrow={true} style={{ padding: "2px" }} />
      <FixedSizeAsyncButtonRight
        isLoading={cancelOutgoingFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="green" />}
        buttonRight={
          <button
            onClick={removeExistingFriend}
            data-tooltip-id={TOOLTIP_ID}
            data-tooltip-content="remove friend"
          >
            <RxCross2 />
          </button>
        }
        className="rounded bg-green-600 p-2 font-semibold"
      >
        <FaUserCheck />
        friends
      </FixedSizeAsyncButtonRight>
    </>
  );
}
