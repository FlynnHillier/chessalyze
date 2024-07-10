"use client";

import { WebSocketProvider } from "next-ws/client";
import { ReactNode, useEffect } from "react";
import { env } from "~/env";
import { useWebSocket } from "next-ws/client";
import { wsClientToServerMessage } from "~/lib/ws/messages/server.messages.ws";
import { useInterval } from "usehooks-ts";

function HeartBeat() {
  const ws = useWebSocket();

  function emitHeartbeat() {
    ws?.send(
      wsClientToServerMessage
        .send("HEARTBEAT")
        .data({
          timestamp: Date.now(),
        })
        .stringify(),
    );
  }

  useEffect(() => {
    if (ws?.readyState === ws?.OPEN) emitHeartbeat();
  }, [ws?.readyState]);

  useInterval(() => {
    emitHeartbeat();
  }, 12000);

  return <></>;
}

/**
 * Provides a websocket instance to children for access anywhere within the app.
 */
export function WSProvider({ children }: { children: ReactNode }) {
  return (
    <WebSocketProvider url={`ws://localhost:${env.PORT}/api/ws`}>
      <HeartBeat />
      {children}
    </WebSocketProvider>
  );
}
