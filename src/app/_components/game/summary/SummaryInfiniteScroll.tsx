import { useState, useRef } from "react";
import InfiniteScroller from "../../common/scroll/InfiniteScroll";
import { trpc } from "~/app/_trpc/client";
import { GameSummary } from "~/types/game.types";
import { GameSummaryPill } from "./GameSummaryPill";
import SyncLoader from "../../loading/SyncLoader";

/**
 * Infinite scroll over recent game summarys.
 *
 */
export default function SummaryInfiniteScroll({
  countPerScroll = 5,
}: {
  countPerScroll: number;
}) {
  const [isMore, setIsMore] = useState<boolean>(true);
  const tail = useRef<number>(0);
  const [summarys, setSummarys] = useState<GameSummary[]>([]);

  const trpcSummaryInfiniteScroll =
    trpc.game.summary.infiniteScroll.useMutation();

  async function fetchNext() {
    const res = await trpcSummaryInfiniteScroll.mutateAsync({
      start: tail.current,
      count: countPerScroll,
    });

    tail.current = res.tail;
    setIsMore(res.isMore);
    setSummarys((p) => [...p, ...res.data]);
  }

  return (
    <div className="h-full w-full">
      <InfiniteScroller
        isMore={isMore}
        loadNext={async (loaded) => {
          await fetchNext();
          loaded();
        }}
        onLoading={<SyncLoader dotCount={4} customTailwind="bg-stone-900" />}
        onNoMore={
          <span className="text-balance text-center text-lg font-semibold">
            You've reached the end. Nothing more to see here!
          </span>
        }
      >
        {summarys.map((summary, i) => (
          <GameSummaryPill summary={summary} key={i} redirect={true} />
        ))}
      </InfiniteScroller>
    </div>
  );
}
