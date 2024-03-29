"use client";

import { useWebSocket } from "next-ws/client";
import { useCallback, useEffect } from "react";
import { validateWSMessage } from "~/app/_components/providers/ws.provider";
import Test from "~/app/_components/test";

/**
 * Test page reigster socket.
 */
export default function TestPage() {
  const ws = useWebSocket();

  const onWSMessageEvent = useCallback(
    (e: MessageEvent<any>) => {
      const valid = validateWSMessage(e);
      if (!valid) return;

      const { event, data } = valid;

      switch (event) {
        case "DEV_ID":
          console.log("Socket identified: ", data);
          break;
        case "DEV_TEST":
          console.log("Socket received dev test event: ", data);
          break;
      }
    },
    [ws],
  );

  useEffect(() => {
    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws, onWSMessageEvent]);

  return (
    <>
      <Test />
    </>
  );
}
