import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ClassNameValue } from "tailwind-merge";
import { SocialUserSquaredProfilePicture } from "~/app/_components/social.components";
import { SocialUser } from "~/types/social.types";

export function InboxedNotificationCardContainer({
  children,
  header,
}: {
  children?: ReactNode;
  header?: string;
}) {
  return (
    <div className="h-fit w-96 flex-col items-start rounded bg-stone-900 px-1 pb-2">
      {header && <span className="px-1 text-sm font-semibold">{header}</span>}
      <hr className="mb-1.5 w-full border-stone-700" />
      <div className="flex h-10 flex-row px-1">{children}</div>
    </div>
  );
}

export function InboxedNotificationCardUserBanner({
  user,
}: {
  user: SocialUser;
}) {
  const router = useRouter();

  return (
    <div
      className="flex flex-row gap-2 text-base font-bold hover:cursor-pointer"
      onClick={() => {
        router.push(`/social/user/${user.id}`);
      }}
    >
      <SocialUserSquaredProfilePicture user={user} size={40} />
      {user.username}
    </div>
  );
}
