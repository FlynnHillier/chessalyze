"use client";

import { trpc } from "~/app/_trpc/client";
import { FixedSizeAsyncButton } from "~/app/_components/common/buttons/AsyncButton";
import { ScaleLoader } from "react-spinners";
import { FaUserPlus } from "react-icons/fa";

//TODO: add some functionality to client side to know if user is / is not friends with user.

/**
 * Button that allows for mutation of friendship status
 */
export function AddFriendButton({
  target,
  ...otherProps
}: {
  target: {
    id: string;
  };
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const friendRequestMutation = trpc.social.friend.request.send.useMutation();
  async function sendFriendRequest(): Promise<boolean> {
    const response = await friendRequestMutation.mutateAsync({
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
      isLoading={friendRequestMutation.isLoading}
      onLoading={<ScaleLoader height={20} color="black" />}
    >
      <div className="flex h-full w-full flex-row flex-nowrap items-center gap-x-1 text-nowrap text-center">
        <FaUserPlus size={20} />
        add friend
      </div>
    </FixedSizeAsyncButton>
  );
}
