"use client";

import { useState, useRef, useEffect } from "react";
import InfiniteScroller from "../../common/scroll/InfiniteScroll";
import { trpc } from "~/app/_trpc/client";
import { GameSummary } from "~/types/game.types";
import { GameSummaryPill } from "./GameSummaryPill";
import SyncLoader from "../../loading/SyncLoader";
import { useWebSocket } from "next-ws/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";

/**
 * Infinite scroll over recent game summarys.
 *
 */
export default function SummaryInfiniteScroll({
  countPerScroll = 10,
}: {
  countPerScroll?: number;
}) {
  const [isMore, setIsMore] = useState<boolean>(true);
  const tail = useRef<number>(0);
  const [summarys, setSummarys] = useState<GameSummary[]>([]);

  const ws = useWebSocket();
  const trpcSummaryInfiniteScroll =
    trpc.game.summary.infiniteScroll.useMutation();

  /**
   * Emit subscribe event to server so that component receives message when new game summary occurs
   */
  useEffect(() => {
    if (ws?.readyState === 1)
      ws.send(
        wsClientToServerMessage.send("SUMMARY_SUBSCRIBE").data({}).stringify(),
      );
  }, [ws?.readyState]);

  /**
   * Add handlers for incoming ws message, such that summarys are updated when data is received.
   */
  useEffect(() => {
    if (!ws) return;

    function onMessage(message: MessageEvent) {
      return wsServerToClientMessage.receiver({
        SUMMARY_NEW: (summary) => {
          setSummarys((p) => [summary, ...p]);
          tail.current++;
        },
      })(message.data);
    }

    ws.addEventListener("message", onMessage);

    return () => {
      ws.removeEventListener("message", onMessage);

      //TODO: add unsubscribe emit here
    };
  }, [ws]);

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
        loadNext={fetchNext}
        onLoading={<SyncLoader dotCount={4} customTailwind="bg-stone-800" />}
        onNoMore={
          <span className="text-balance text-center text-lg font-semibold">
            You've reached the end. Nothing more to see here!
          </span>
        }
      >
        {summarys.map((summary, i) => (
          <GameSummaryPill summary={summary} key={summary.id} redirect={true} />
        ))}
      </InfiniteScroller>
    </div>
  );
}
