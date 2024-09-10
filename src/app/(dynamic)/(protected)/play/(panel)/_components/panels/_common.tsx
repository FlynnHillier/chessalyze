import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ClassNameValue } from "tailwind-merge";
import { SocialUserSquaredProfilePicture } from "~/app/_components/social.components";
import { cn } from "~/lib/util/cn";
import { SocialUser } from "~/types/social.types";

export function CommonConfigureSocialUserCard({
  className,
  user,
  children,
}: {
  className?: ClassNameValue;
  user: SocialUser;
  children: ReactNode;
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

      {children}
    </div>
  );
}

export function CommonMappedSocialUserCardContainer({
  className,
  children,
}: {
  className?: ClassNameValue;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-60 w-full flex-col flex-wrap justify-start gap-x-1 gap-y-1.5 overflow-auto border-y border-stone-700 px-1 py-2 scrollbar-hide",
        className,
      )}
    >
      {children}
    </div>
  );
}
