"use client";

import { trpc } from "~/app/_trpc/client";
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
import { useDispatchProfile, useProfile } from "./ProfileView.context";

type ButtonCallbacks<T extends `on${Capitalize<string>}`> = Partial<
  Record<T, (success: boolean, error?: Error) => any>
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
  onError?: (e: Error) => any;
}) {
  const dispatchProfile = useDispatchProfile();
  const profile = useProfile();

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

  function onSendFriendRequest(success: boolean, error?: Error) {
    if (success)
      dispatchProfile({
        type: "FRIEND_STATUS_CHANGE",
        payload: { status: "request_outgoing" },
      });
    else onError?.(error ?? new Error("failed to send friend request"));
  }

  function onCancelOutgoingFriendRequest(success: boolean, error?: Error) {
    if (success)
      dispatchProfile({
        type: "FRIEND_STATUS_CHANGE",
        payload: { status: "none" },
      });
    else onError?.(error ?? new Error("failed to cancel friend request"));
  }

  function onAcceptFriendRequest(success: boolean, error?: Error) {
    if (success)
      dispatchProfile({
        type: "FRIEND_STATUS_CHANGE",
        payload: { status: "confirmed" },
      });
    else onError?.(error ?? new Error("failed to accept friend request"));
  }

  function onRejectFriendRequest(success: boolean, error?: Error) {
    if (success)
      dispatchProfile({
        type: "FRIEND_STATUS_CHANGE",
        payload: { status: "none" },
      });
    else onError?.(error ?? new Error("failed to accept friend request"));
  }

  function onRemoveExistingFriend(success: boolean, error?: Error) {
    if (success)
      dispatchProfile({
        type: "FRIEND_STATUS_CHANGE",
        payload: { status: "none" },
      });
    else onError?.(error ?? new Error("failed to remove friend"));
  }

  return !profile.profile?.friend ? (
    <PlaceHolderLoadingButton />
  ) : profile.profile?.friend.status === "confirmed" ? (
    <HandleExistingFriendButton
      target={target}
      callbacks={{ onRemoveExistingFriend }}
    />
  ) : profile.profile?.friend.status === "request_outgoing" ? (
    <HandleOutgoingFriendRequestButton
      target={target}
      callbacks={{ onCancelOutgoingFriendRequest }}
    />
  ) : profile.profile?.friend.status === "request_incoming" ? (
    <HandleIncomingFriendRequest
      target={target}
      callbacks={{ onAcceptFriendRequest, onRejectFriendRequest }}
    />
  ) : profile.profile?.friend.status === "none" ? (
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
    <div className="flex h-full w-fit flex-row flex-nowrap items-center gap-x-1 text-nowrap text-center">
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
      if (e instanceof Error) callbacks?.onSendFriendRequest?.(false, e);

      callbacks?.onSendFriendRequest?.(false);
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
      if (e instanceof Error) callbacks?.onAcceptFriendRequest?.(false, e);
      callbacks?.onAcceptFriendRequest?.(false);
    }
  }

  async function rejectFriendRequest() {
    try {
      const response = await rejectFriendRequestMutation.mutateAsync({
        targetUserID: target.id,
      });

      callbacks?.onRejectFriendRequest?.(response.success);
    } catch (e) {
      if (e instanceof Error) callbacks?.onRejectFriendRequest?.(false, e);
      callbacks?.onRejectFriendRequest?.(false);
    }
  }

  return (
    <div className="flex flex-row gap-1">
      <FixedSizeAsyncButton
        className="w-fit rounded bg-green-600 p-2 font-semibold "
        onClick={acceptFriendRequest}
        isLoading={acceptFriendRequestMutation.isLoading}
        disabled={rejectFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="green" />}
      >
        <SocialButtonContent Icon={FaUserPlus} text={"accept"} />
      </FixedSizeAsyncButton>
      <FixedSizeAsyncButton
        className="w-fit rounded bg-red-800 p-2 font-semibold "
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
  button?: React.ButtonHTMLAttributes<HTMLButtonElement>;
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
      if (e instanceof Error)
        callbacks?.onCancelOutgoingFriendRequest?.(false, e);
      callbacks?.onCancelOutgoingFriendRequest?.(false);
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
        className="w-fit  rounded bg-green-600 p-2 font-semibold"
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
      if (e instanceof Error) callbacks?.onRemoveExistingFriend?.(false, e);
      callbacks?.onRemoveExistingFriend?.(false);
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
        className="w-fit rounded bg-green-600 p-2 font-semibold"
      >
        <FaUserCheck />
        friends
      </FixedSizeAsyncButtonRight>
    </>
  );
}
