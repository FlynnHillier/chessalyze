"use client";

import { GameSummary, Player } from "~/types/game.types";
import Image from "next/image";
import { FaCrown } from "react-icons/fa";
import { MdTimerOff, MdTimer } from "react-icons/md";
import { LiveRelativeTime } from "react-live-relative-time";
import ImageWithFallback from "../../common/image/ImageWithFallback";
import { useRouter } from "next/navigation";

function PlayerBanner({
  player,
  victor,
}: {
  player: Player | undefined;
  victor: boolean;
}) {
  return (
    <div className="relative flex h-full flex-row items-center justify-start gap-1 text-xs  font-bold @sm:text-lg">
      <div className="flex w-full max-w-fit flex-row items-center gap-1 overflow-hidden text-ellipsis text-nowrap @sm:gap-2">
        <img
          src={player?.image ?? "/blankuser.png"}
          alt={
            player
              ? `${player.username}'s profile picture`
              : "blank profile picture"
          }
          className="aspect-square w-6 rounded object-fill @sm:w-10"
        />
        {player?.username ?? "unknown player"}
      </div>
      {victor && (
        <span className="min-w-fit text-yellow-500">
          <FaCrown />
        </span>
      )}
    </div>
  );
}

/**
 * Display game summary in a pill format
 *
 */
function GameSummaryPill({ summary }: { summary: GameSummary }) {
  const router = useRouter();

  return (
    <div
      className="flex h-20 w-52 flex-row items-center gap-2 rounded bg-stone-900 p-2 @container-normal hover:cursor-pointer @sm:h-32 @sm:w-80"
      onClick={() => {
        router.push(`/play/view/${summary.id}`);
      }}
    >
      <ImageWithFallback
        src={`/chess/games/${summary.id}.png`}
        fallbackSrc={"/chess/games/_default.png"}
        alt={`game: ${summary.id}`}
        className="col-span-1 aspect-square h-full rounded object-fill"
      />
      <div className="flex h-full w-full flex-col @sm:gap-1 ">
        <div className="col-span-1 flex h-full w-full flex-col gap-1 @sm:gap-3">
          <PlayerBanner
            player={summary.players.w}
            victor={summary.conclusion.victor === "w"}
          />
          <PlayerBanner
            player={summary.players.b}
            victor={summary.conclusion.victor === "b"}
          />
        </div>
        <div className="flex h-full w-full flex-row items-center justify-between  gap-1  text-sm font-semibold @sm:text-base">
          <div className="flex flex-row items-center gap-x-0.5">
            {summary.time.clock ? (
              <>
                <MdTimer /> {summary.time.clock.initial.template}
              </>
            ) : (
              <MdTimerOff />
            )}
          </div>
          <div className="items-baseline text-xs font-semibold">
            <LiveRelativeTime timestamp={summary.time.end} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A scrollable view of given game summarys.
 *
 * Styling should be provided, aswell as dimensions. The element will fill its parent.
 */
export function GameSummarysScroller({
  summarys,
}: {
  summarys: GameSummary[];
}) {
  return (
    <div className="flex h-full w-full flex-row flex-wrap justify-start gap-x-2 gap-y-2 overflow-y-scroll @container-normal scrollbar-hide">
      {summarys.map((summary) => (
        <GameSummaryPill summary={summary} key={summary.id} />
      ))}
    </div>
  );
}
