import { GameSummary } from "~/types/game.types";

/**
 * Display game summary in a pill format
 */
function GameSummaryPill({ summary }: { summary: GameSummary }) {
  return (
    <div className="rounded bg-stone-800">
      <div>Hello world</div>
    </div>
  );
}

export default function GameSummarysOverview({
  summarys,
}: {
  summarys: GameSummary[];
}) {
  return (
    <div className="rounded bg-stone-800">
      {summarys.map((summary) => (
        <GameSummaryPill summary={summary} />
      ))}
    </div>
  );
}
