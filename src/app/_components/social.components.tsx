import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { cn } from "~/lib/util/cn";
import { SocialUser } from "~/types/social.types";

export function SocialUserSquaredProfilePicture({
  size,
  user,
}: {
  size?: number;
  user: SocialUser;
}) {
  const DEFAULT_SIZE_PX = 12;

  return (
    <div
      className={cn("w- relative aspect-square flex-shrink-0 ")}
      style={{ width: size ?? DEFAULT_SIZE_PX }}
    >
      <img
        className="left-0 top-0 h-full w-full overflow-hidden rounded bg-cover"
        alt={`${user.username}'s profile picture`}
        src={
          user.imageURL
            ? resizeGoogleProfilePictureURL(
                user.imageURL,
                size ?? DEFAULT_SIZE_PX,
              )
            : "/blankuser.png"
        }
      />
    </div>
  );
}
