"use client";

import { useWebSocket } from "next-ws/client";
import { useEffect, useRef, useState } from "react";
import { BeatLoader } from "react-spinners";
import InfiniteScroller from "~/app/_components/common/scroll/InfiniteScroll";
import { GameSummaryPill } from "~/app/_components/game/summary/GameSummaryPill";
import { trpc } from "~/app/_trpc/client";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { GameSummary } from "~/types/game.types";

export function PlayerRecentGameSummarys({
  profile,
}: {
  profile: { id: string };
}) {
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
      sendProfileRecentGameUnSubscribeEvent();

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
      })(e.data);
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
      onLoading={<BeatLoader size={14} color="gray" />}
      onNoMore={
        <span className="text-balance text-center text-lg font-semibold">
          {gameSummarys.length > 0
            ? ""
            : "This user is yet to play any games - why not give them a challenge?"}
        </span>
      }
      className="justify-start"
    >
      {gameSummarys.map((summary, i) => (
        <GameSummaryPill
          summary={summary}
          key={summary.id}
          redirect={true}
          className="hover:bg-stone-950"
        />
      ))}
    </InfiniteScroller>
  );
}
