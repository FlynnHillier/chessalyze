"use client";

import { WebSocketProvider } from "next-ws/client";
import { ReactNode } from "react";
import { env } from "~/env";
import { EmitEvent } from "~/lib/ws/events.ws";

/**
 * Log to console when ws message validation fails
 */
function onInvalidWSMessage(payload: string, message?: string): null {
  console.error(
    `Invalid ws message payload${message ? ` ${message}` : ""} :`,
    payload,
  );
  return null;
}

/**
 * Validate that incoming ws message event's payload is in the format we want it be.
 *
 * @param e incoming message event
 */
export function validateWSMessage(e: MessageEvent<string>): null | EmitEvent {
  try {
    const { event, data } = JSON.parse(e.data);

    if (!event || !data) {
      return onInvalidWSMessage(
        e.data,
        "missing required keys 'event' || 'data'",
      );
    }

    //TODO: zod validation?

    return { event, data };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return onInvalidWSMessage(e.data, "invalid JSON");
    }
    return onInvalidWSMessage(e.data);
  }
}

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
