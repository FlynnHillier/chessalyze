"use client";

import { WebSocketProvider } from "next-ws/client";
import { ReactNode, useEffect } from "react";
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
 * The WebSocket server runs on the same origin as the page, so the browser derives
 * its address from where it already is: wss:// on an https page, ws:// on http.
 *
 * During server rendering there is no `location`. The provider never opens a
 * socket on the server, so an empty string is passed there and ignored.
 */
function wsUrl(): string {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/api/ws`;
}

/**
 * Provides a websocket instance to children for access anywhere within the app.
 */
export function WSProvider({ children }: { children: ReactNode }) {
  return (
    <WebSocketProvider url={wsUrl()}>
      <HeartBeat />
      {children}
    </WebSocketProvider>
  );
}
