import { ReactNode } from "react";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { cn } from "~/lib/util/cn";
import { SocialUser, VerboseSocialUser } from "~/types/social.types";

const DEFAULT_SIZE_PX = 12;

export function BaseSocialUserSquaredProfilePicture({
  size,
  user,
  children,
}: {
  size?: number;
  user: SocialUser;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn("relative aspect-square flex-shrink-0")}
      style={{ width: size ?? DEFAULT_SIZE_PX }}
    >
      <img
        className="left-0 top-0 h-full w-full overflow-hidden rounded border-0 bg-stone-600 bg-cover"
        src={
          user.imageURL
            ? resizeGoogleProfilePictureURL(
                user.imageURL,
                size ?? DEFAULT_SIZE_PX,
              )
            : "/blankuser.png"
        }
      />
      {children}
    </div>
  );
}

export function SocialUserSquaredProfilePicture({
  size,
  user,
}: {
  size?: number;
  user: SocialUser;
}) {
  return <BaseSocialUserSquaredProfilePicture user={user} size={size} />;
}

export function VerboseSocialUserSquaredProfilePicture({
  size,
  verboseUser,
}: {
  size?: number;
  verboseUser: VerboseSocialUser;
}) {
  return (
    <BaseSocialUserSquaredProfilePicture user={verboseUser.user} size={size}>
      <span
        className={cn(
          "absolute -bottom-1 -right-1 z-[0] inline-block aspect-square rounded-full",
          {
            "bg-green-600": verboseUser.activity.isOnline,
            "bg-red-700": !verboseUser.activity.isOnline,
          },
        )}
        style={{
          width: Math.ceil((size ?? DEFAULT_SIZE_PX) / 4),
        }}
      />
    </BaseSocialUserSquaredProfilePicture>
  );
}
