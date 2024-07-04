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

//TODO: add some functionality to client side to know if user is / is not friends with user.

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
 * Button that allows for mutation of friendship status
 */
export function SendFriendRequestButton({
  target,
  ...otherProps
}: {
  target: {
    id: string;
  };
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sendFriendRequestMutation =
    trpc.social.friend.request.send.useMutation();

  async function sendFriendRequest(): Promise<boolean> {
    const response = await sendFriendRequestMutation.mutateAsync({
      targetUserID: target.id,
    });

    if (response.success) {
    }

    return false;
  }

  return (
    <FixedSizeAsyncButton
      {...otherProps}
      className={
        "rounded bg-stone-600 p-2 font-semibold " +
        ` ${otherProps.className ?? ""}`
      }
      onClick={sendFriendRequest}
      isLoading={sendFriendRequestMutation.isLoading}
      onLoading={<ScaleLoader height={20} color="black" />}
    >
      <SocialButtonContent Icon={FaUserPlus} text={"add friend"} />
    </FixedSizeAsyncButton>
  );
}

export function HandleIncomingFriendRequest({
  target,
  ...otherProps
}: {
  target: {
    id: string;
  };
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const acceptFriendRequestMutation =
    trpc.social.friend.request.accept.useMutation();

  const rejectFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation();

  async function acceptFriendRequest(): Promise<boolean> {
    const response = await acceptFriendRequestMutation.mutateAsync({
      targetUserID: target.id,
    });

    if (response.success) {
    }

    return false;
  }

  async function rejectFriendRequest(): Promise<boolean> {
    const response = await rejectFriendRequestMutation.mutateAsync({
      targetUserID: target.id,
    });

    return true;
  }

  return (
    <div className="flex flex-row gap-1">
      <FixedSizeAsyncButton
        {...otherProps}
        className={
          "rounded bg-green-600 p-2 font-semibold " +
          ` ${otherProps.className ?? ""}`
        }
        onClick={acceptFriendRequest}
        isLoading={acceptFriendRequestMutation.isLoading}
        disabled={rejectFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="green" />}
      >
        <SocialButtonContent Icon={FaUserPlus} text={"accept"} />
      </FixedSizeAsyncButton>
      <FixedSizeAsyncButton
        {...otherProps}
        className={
          "rounded bg-red-800 p-2 font-semibold " +
          ` ${otherProps.className ?? ""}`
        }
        onClick={rejectFriendRequest}
        isLoading={rejectFriendRequestMutation.isLoading}
        disabled={acceptFriendRequestMutation.isLoading}
        onLoading={<ScaleLoader height={20} color="black" />}
      >
        <SocialButtonContent Icon={FaUserTimes} text={"ignore"} />
      </FixedSizeAsyncButton>
    </div>
  );
}

export function HandleOutgoingFriendRequestButton({
  target,
  ...otherProps
}: {
  target: {
    id: string;
  };
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const TOOLTIP_ID = "social-cancel-outgoing-request-button";
  const cancelOutgoingFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation();

  async function cancelOutgoingFriendRequest(): Promise<boolean> {
    const response = await cancelOutgoingFriendRequestMutation.mutateAsync({
      targetUserID: target.id,
    });

    if (response.success) {
    }

    return false;
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

export function HandleExistingFriendButton({
  target,
  ...otherProps
}: {
  target: {
    id: string;
  };
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const TOOLTIP_ID = "social-remove-existing-friend-button";
  const cancelOutgoingFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation(); //TODO change

  async function removeExistingFriend(): Promise<boolean> {
    const response = await cancelOutgoingFriendRequestMutation.mutateAsync({
      targetUserID: target.id,
    });

    if (response.success) {
    }

    return false;
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
