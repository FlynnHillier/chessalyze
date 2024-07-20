"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { GameSummary } from "~/types/game.types";
import { trpc } from "~/app/_trpc/client";
import InfiniteScroller from "~/app/_components/common/scroll/InfiniteScroll";
import { GameSummaryPill } from "~/app/_components/game/summary/GameSummaryPill";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

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
    <div className="h-48 w-48 overflow-hidden rounded-full bg-stone-500">
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
        <div className="overflow-auto scrollbar-hide">
          <div className="flex min-h-min flex-col items-center">
            <UserProfilePicture
              imageURL={
                profile.user.imageURL &&
                resizeGoogleProfilePictureURL(profile.user.imageURL, 300)
              }
            />
            <div className="inline-block w-fit max-w-full text-center">
              <span className="mt-5 text-balance px-5 pb-3 text-4xl font-bold">
                {profile.user.username}
              </span>
              {user && user.id !== profile.user.id && (
                <div className="mt-3 flex w-full flex-row justify-center overflow-hidden px-2">
                  <FriendInteractionButton
                    target={{ id: profile.user.id }}
                    onError={(e) => {
                      showGlobalError(e.message ?? "something went wrong");
                    }}
                  />
                </div>
              )}
              <hr className="mt-3 box-border w-full border-stone-400 bg-stone-600 " />
            </div>
            <div className="mt-1 flex h-fit w-full  flex-col items-center rounded px-2 text-center">
              <ProfileStatsView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerRecentGameSummarys({ profile }: { profile: { id: string } }) {
  const ws = useWebSocket();
  const profileRecentGameSummaryInfiniteScrollMutation =
    trpc.social.profile.games.infiniteScroll.useMutation();

  const [isMore, setIsMore] = useState<boolean>(true);
  const [gameSummarys, setGameSummarys] = useState<GameSummary[]>([]);
  const tail = useRef<number>(0);

  async function fetchNext() {
    const res =
      await profileRecentGameSummaryInfiniteScrollMutation.mutateAsync({
        profile: {
          id: profile.id,
        },
        start: tail.current,
        count: 10,
      });

    tail.current = res.tail;
    setIsMore(res.isMore);
    setGameSummarys((p) => [...p, ...res.data]);
  }

  function sendProfileRecentGameSubscribeEvent() {
    if (ws && ws.readyState === ws.OPEN)
      ws.send(
        wsClientToServerMessage
          .send("PROFILE:RECENT_GAMES:SUBSCRIBE")
          .data({
            profile: {
              id: profile.id,
            },
          })
          .stringify(),
      );
  }

  function sendProfileRecentGameUnSubscribeEvent() {
    if (ws && ws.readyState === ws.OPEN)
      ws.send(
        wsClientToServerMessage
          .send("PROFILE:RECENT_GAMES:UNSUBSCRIBE")
          .data({
            profile: {
              id: profile.id,
            },
          })
          .stringify(),
      );
  }

  /**
   * Emit subscribe event to server so that component receives message when new game summary occurs
   */
  useEffect(() => {
    if (!ws || ws.readyState !== ws.OPEN) return;

    sendProfileRecentGameSubscribeEvent();

    window.addEventListener(
      "beforeunload",
      sendProfileRecentGameUnSubscribeEvent,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        sendProfileRecentGameUnSubscribeEvent,
      );
    };
  }, [ws?.readyState]);

  useEffect(() => {
    function onWSMessageEvent(e: MessageEvent) {
      wsServerToClientMessage.receiver({
        "PROFILE:NEW_GAME_SUMMARY": (summary) => {
          setGameSummarys((p) => [summary, ...p]);
          tail.current++;
        },
      });
    }

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  return (
    <InfiniteScroller
      isMore={isMore}
      loadNext={fetchNext}
      onLoading={<SyncLoader dotCount={4} customTailwind="bg-stone-800" />}
      onNoMore={
        <span className="text-balance text-center text-lg font-semibold">
          {gameSummarys.length > 0
            ? "No more games to see here"
            : "This user is yet to play any games - why not give them a challenge?"}
        </span>
      }
    >
      {gameSummarys.map((summary, i) => (
        <GameSummaryPill summary={summary} key={summary.id} redirect={true} />
      ))}
    </InfiniteScroller>
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
      className={cn(
        "relative flex h-full w-full flex-col items-stretch bg-stone-800",
        className,
      )}
    >
      <div className="absolute left-0 top-0 box-border h-full w-full">
        <div className="mb-3 bg-stone-800 px-3 pb-3 pt-3 shadow-xl">
          <div className="flex w-fit flex-row flex-nowrap items-baseline gap-x-1.5">
            <span className="inline-block text-4xl font-bold">
              {profile?.activity.status.isOnline ? "online" : "offline"}
            </span>
            <span
              className={cn("inline-block h-5 w-5 rounded-full", {
                "bg-green-600": profile?.activity.status.isOnline,
                "bg-red-600": !profile?.activity.status.isOnline,
              })}
            />
          </div>
          <span className="text-lg font-semibold">
            {profile?.activity.status.messages.primary}{" "}
            {profile?.activity.status.messages.primary &&
              profile.activity.status.messages.secondary &&
              `- ${profile.activity.status.messages.secondary}`}
          </span>
        </div>
        <div className="h-5/6 p-3 pb-3">
          {/* TODO: the height is sorted of cheated here */}
          {profile && (
            <PlayerRecentGameSummarys profile={{ id: profile?.user.id }} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="box-border flex h-full w-full flex-row flex-nowrap ">
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
