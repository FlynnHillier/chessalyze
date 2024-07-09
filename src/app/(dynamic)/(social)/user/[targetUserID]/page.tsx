"use client";

import { useEffect, useMemo, useState } from "react";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import {
  ProfileViewProvider,
  useProfile,
} from "./_components/ProfileView.context";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { FriendInteractionButton } from "./_components/SocialButtons";
import { useSession } from "~/app/_components/providers/client/session.provider";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { cn } from "~/lib/util/cn";
import { useWebSocket } from "next-ws/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";

/**
 *
 * Displays game stats regarding user pfofile
 *
 */
function ProfileStatsView() {
  const profile = useProfile();

  const [selectedStatView, setSelectedStatView] = useState<
    "all" | "white" | "black"
  >("all");
  const [statFormat, setStatFormat] = useState<"number" | "percentage">(
    "number",
  );
  const stats = useMemo<
    | {
        total: string;
        won: string;
        lost: string;
        drawn: string;
      }
    | undefined
  >(() => {
    if (!profile?.profile?.stats) return undefined;

    const sourceStats = profile.profile.stats;

    const source =
      selectedStatView === "all"
        ? "total"
        : selectedStatView === "black"
          ? "asBlack"
          : selectedStatView === "white"
            ? "asWhite"
            : undefined;

    if (!source) return undefined;

    const total =
      statFormat === "number"
        ? sourceStats.all[source].toString()
        : `${Math.round((sourceStats.all[source] / sourceStats.all.total) * 100)}%`;
    const won =
      statFormat === "number"
        ? sourceStats.won[source].toString()
        : `${Math.round((sourceStats.won[source] / sourceStats.all[source]) * 100)}%`;
    const lost =
      statFormat === "number"
        ? sourceStats.lost[source].toString()
        : `${Math.round((sourceStats.lost[source] / sourceStats.all[source]) * 100)}%`;
    const drawn =
      statFormat === "number"
        ? sourceStats.drawn[source].toString()
        : `${Math.round((sourceStats.drawn[source] / sourceStats.all[source]) * 100)}%`;

    return {
      total,
      won,
      lost,
      drawn,
    };
  }, [selectedStatView, statFormat, profile?.profile?.stats]);

  /**
   * Switch between number / percentage view
   */
  function toggleStatFormat() {
    if (statFormat === "number") setStatFormat("percentage");
    else setStatFormat("number");
  }

  return (
    stats && (
      <div className="flex h-fit w-fit select-none flex-col items-center text-center">
        <span className=" pb-1 text-lg font-bold"> Match stats </span>

        <div className="w-fit px-5">
          <div className="flex h-fit w-fit flex-row gap-0.5 rounded  p-0.5 text-xs font-semibold [&>button]:first:rounded-l-sm [&>button]:last:rounded-r-sm">
            <button
              className={`bg-stone-${selectedStatView === "all" ? "950" : "800"} px-1.5 py-1`}
              onClick={() => {
                setSelectedStatView("all");
              }}
            >
              all
            </button>
            <button
              className={`bg-stone-${selectedStatView === "white" ? "950" : "800"} px-1.5 py-1`}
              onClick={() => {
                setSelectedStatView("white");
              }}
            >
              as white
            </button>
            <button
              className={`bg-stone-${selectedStatView === "black" ? "950" : "800"} px-1.5 py-1`}
              onClick={() => {
                setSelectedStatView("black");
              }}
            >
              as black
            </button>
          </div>
        </div>
        <hr className="mb-1 mt-2 box-border w-full border-stone-400 bg-stone-600 text-sm " />
        <div className="flex h-fit w-full max-w-full flex-col items-center gap-1 text-nowrap rounded-sm pb-2 pt-0.5 text-center text-sm tabular-nums">
          <span
            className="px-5 font-semibold hover:cursor-pointer"
            onClick={toggleStatFormat}
          >
            <span className="font-extrabold tracking-wide ">{stats.total}</span>
            {` ${statFormat === "percentage" ? "of " : ""}games played`}
          </span>
          <hr className="my-0.5 box-border w-full border-stone-400 bg-stone-600 " />

          <div className="grid grid-cols-3 grid-rows-2 gap-x-2 text-center">
            <div
              className="col-span-1 row-span-full grid w-fit grid-cols-subgrid hover:cursor-pointer"
              onClick={toggleStatFormat}
            >
              <span className="row-span-1 font-semibold ">won</span>
              <span className="row-span-1 font-extrabold tracking-wide">
                {stats.won}
              </span>
            </div>
            <div
              className="col-span-1 row-span-full grid w-fit grid-cols-subgrid hover:cursor-pointer"
              onClick={toggleStatFormat}
            >
              <span className="row-span-1 font-semibold">lost</span>
              <span className="row-span-1 font-extrabold tracking-wide">
                {stats.lost}
              </span>
            </div>
            <div
              className="col-span-1 row-span-full grid w-fit grid-cols-subgrid hover:cursor-pointer"
              onClick={toggleStatFormat}
            >
              <span className="row-span-1 font-semibold ">drawn</span>
              <span className="row-span-1 font-extrabold tracking-wide">
                {stats.drawn}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

/**
 * Display user profile picture
 */
function UserProfilePicture({ imageURL }: { imageURL: string | null }) {
  return (
    <div className="aspect-square w-48 overflow-hidden rounded-full bg-stone-500">
      <img src={imageURL ?? "/blankuser.png"} className="bg-cover" />
    </div>
  );
}

/**
 * Page view - side banner
 */
function UserSideBanner({
  className,
  ...otherprops
}: React.HTMLAttributes<HTMLDivElement>) {
  const { user } = useSession();
  const { profile, isLoading } = useProfile();
  const { showGlobalError } = useGlobalError();

  return (
    <div
      {...otherprops}
      className={cn(
        "flex h-full min-h-80 w-120 min-w-fit flex-col items-center rounded bg-stone-900 p-3",
        className,
      )}
    >
      {isLoading ? (
        <SyncLoader />
      ) : !profile ? (
        "profile does not seem to exist"
      ) : (
        <>
          <UserProfilePicture
            imageURL={
              profile.user.imageURL &&
              resizeGoogleProfilePictureURL(profile.user.imageURL, 300)
            }
          />
          <span className="mt-5 pb-3 text-4xl font-bold">
            {profile.user.username}
          </span>
          {user && user.id !== profile.user.id && (
            <FriendInteractionButton
              target={{ id: profile.user.id }}
              onError={(e) => {
                showGlobalError(e.message ?? "something went wrong");
              }}
            />
          )}
          <div className="mt-3 flex h-fit w-full  flex-col items-center rounded  px-2 pt-3 text-center">
            <hr className="mb-3 box-border w-4/5 border-stone-400 bg-stone-600 " />
            <ProfileStatsView />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Page view - side banner
 */
function UserContentSection({
  className,
  ...otherprops
}: React.HTMLAttributes<HTMLDivElement>) {
  const { profile } = useProfile();

  return (
    <div
      {...otherprops}
      className={cn("flex h-full w-full flex-col bg-stone-800 p-4", className)}
    >
      <span className="text-4xl font-bold">
        {profile?.activity.status.primary}
      </span>
      <span className="text-lg font-semibold">
        {profile?.activity.status.secondary}
      </span>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="flex h-full w-full flex-row flex-nowrap ">
      <UserSideBanner className="rounded-l-md rounded-r-none" />
      <UserContentSection className="rounded-r-md" />
    </div>
  );
}

/**
 * A page to view details regarding the specified user
 */
export default function ViewUserProfilePage({
  params,
}: {
  params: {
    targetUserID: string;
  };
}) {
  return (
    <ProfileViewProvider target={{ id: params.targetUserID }}>
      <ProfileView />
    </ProfileViewProvider>
  );
}