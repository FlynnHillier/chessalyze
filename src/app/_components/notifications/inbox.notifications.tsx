"use client";

import { useRouter } from "next/navigation";
import { RiInbox2Fill } from "react-icons/ri";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "~/lib/util/cn";
import { useNotifcations } from "../providers/client/notifications.provider";

/**
 * Inbox icon to be overlayed onto all pages
 *
 */
export function NotificationInboxIcon({
  className,
}: {
  className?: ClassNameValue;
}) {
  const router = useRouter();

  const { challenge, friendRequest } = useNotifcations();

  return (
    <div
      className={cn(
        "relative flex aspect-square w-12 items-center justify-center rounded-full border-2 border-stone-700 bg-stone-900 hover:cursor-pointer",
        className,
      )}
      onClick={() => {
        router.push("/social/inbox");
      }}
    >
      <RiInbox2Fill size={30} />
      {(challenge.incoming?.length ?? 0) +
        (friendRequest.incoming?.length ?? 0) >
        0 && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 flex aspect-square w-6 items-center justify-center rounded-full  border-2 border-green-700 bg-green-600 px-1 text-center text-sm font-semibold",
          )}
        >
          {(challenge.incoming?.length ?? 0) +
            (friendRequest.incoming?.length ?? 0)}
        </div>
      )}
    </div>
  );
}
