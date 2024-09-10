"use client";

import { ReactNode, useMemo, useState } from "react";
import { ProfileProvider, useProfile } from "./_components/profile.context";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { useSession } from "~/app/_components/providers/client/session.provider";
import { cn } from "~/lib/util/cn";
import { ClassNameValue } from "tailwind-merge";
import { SocialInteractionButton } from "./_components/SocialInteraction";

/**
 *
 * Displays game stats regarding user pfofile
 *
 */
function ProfileStats() {
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
 * Page view - side banner
 */
function ProfileBanner({ className }: { className: ClassNameValue }) {
  const { user } = useSession();
  const { profile } = useProfile();

  return (
    <div
      className={cn(
        "flex h-full w-88 min-w-fit flex-col items-center bg-stone-900 p-3",
        className,
      )}
    >
      <div className="overflow-auto scrollbar-hide">
        <div className="flex min-h-min flex-col items-center">
          <ProfilePicture />
          <div className={cn("inline-block w-fit max-w-full text-center")}>
            <div className="mt-5 text-balance px-5 pb-3 text-4xl font-bold">
              {!profile ? (
                <div className="h-12 w-52 animate-pulse rounded-sm bg-stone-600"></div>
              ) : (
                <span>{profile?.user.username ?? "username"}</span>
              )}
            </div>
            {profile && user && user.id !== profile.user.id && (
              <div className="mt-3 flex w-full flex-row justify-center overflow-hidden px-2">
                <SocialInteractionButton target={{ id: profile.user.id }} />
              </div>
            )}
            <hr className="mt-3 box-border w-full border-stone-400 bg-stone-600 " />
          </div>
          <div className="mt-1 flex h-fit w-full  flex-col items-center rounded px-2 text-center">
            <ProfileStats />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Display user profile picture
 */
function ProfilePicture() {
  const { profile } = useProfile();

  return (
    <div
      className={cn("h-48 w-48 overflow-hidden rounded-full ", {
        "bg-stone-600": !!profile,
      })}
    >
      {!profile ? (
        <div className="h-full w-full animate-pulse bg-stone-600"></div>
      ) : (
        <img
          src={
            profile?.user.imageURL
              ? resizeGoogleProfilePictureURL(profile.user.imageURL, 300)
              : "/blankuser.png"
          }
          className="bg-cover"
        />
      )}
    </div>
  );
}

function SocialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="box-border flex h-full w-full flex-row flex-nowrap ">
      <ProfileBanner className="rounded-l-md rounded-r-none bg-stone-900 " />
      <div className="flex flex-grow flex-col overflow-hidden rounded-r-md bg-stone-800">
        {children}
      </div>
    </div>
  );
}

export default function ({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <SocialLayout>{children}</SocialLayout>
    </ProfileProvider>
  );
}
