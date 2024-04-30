import { GameSummary, Player } from "~/types/game.types";
import Image from "next/image";
import { FaCrown } from "react-icons/fa";
import { MdTimerOff, MdTimer } from "react-icons/md";
import LiveRelativeTime from "../../common/time/LiveRelativeTime";

function PlayerBanner({
  player,
  victor,
}: {
  player: Player | undefined;
  victor: boolean;
}) {
  return (
    <div className="flex flex-row items-center gap-2 text-lg font-bold">
      <div className="relative aspect-square h-full w-9 overflow-hidden rounded">
        <Image
          src={player?.image ?? "/blankuser.png"}
          alt={
            player
              ? `${player.username}'s profile picture`
              : "blank profile picture"
          }
          width={0}
          height={0}
          sizes="100vw"
          fill={true}
        />
      </div>
      {player?.username ?? "unknown player"}
      {victor && (
        <span className="text-yellow-500">
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
  return (
    <div className="flex h-32 w-full flex-row items-center gap-2 rounded bg-stone-900 p-2">
      <img
        src={`/chess/games/${summary.id}.png`}
        className="col-span-1 aspect-square h-full rounded object-fill"
      />
      <div className="flex h-full w-full flex-col gap-1 ">
        <div className="col-span-1 flex w-full flex-col gap-3">
          <PlayerBanner
            player={summary.players.w}
            victor={summary.conclusion.victor === "w"}
          />
          <PlayerBanner
            player={summary.players.b}
            victor={summary.conclusion.victor === "b"}
          />
        </div>
        <div className="flex h-full w-full flex-row items-center justify-between  gap-1  font-semibold">
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
 * Display brief information regarding a collection of Game Summarys
 */
export default function GameSummarysOverview({
  summarys,
}: {
  summarys: GameSummary[];
}) {
  return (
    <div className="flex w-fit flex-col gap-2 rounded bg-stone-800 p-3">
      {summarys.map((summary) => (
        <GameSummaryPill summary={summary} key={summary.id} />
      ))}
    </div>
  );
}
