"use client";

import { WebSocketProvider } from "next-ws/client";
import { ReactNode } from "react";
import { env } from "~/env";

/**
 * Provides a websocket instance to children for access anywhere within the app.
 */
export function WSProvider({ children }: { children: ReactNode }) {
  return (
    <WebSocketProvider url={`ws://localhost:${env.PORT}/api/ws`}>
      <div>{children}</div>
    </WebSocketProvider>
  );
}
