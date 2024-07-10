import { WebSocket, MessageEvent } from "ws";
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { parse as parseCookie } from "cookie";
import { env } from "~/env";
import { lucia } from "~/lib/lucia/lucia";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { onWsClientToServerMessage } from "~/app/api/ws/listeners";
import { ActivityManager } from "~/lib/social/activity.social";

interface WebSocketClient {
  id: string;
}

declare module "ws" {
  interface WebSocket extends WebSocketClient {}
  namespace WebSocket {
    type id = string;
  }
}

function closeConnection(client: WebSocket, reason?: string): void {
  const message = `Closing socket connection${reason ? `: '${reason}'` : ""}`;

  if (env.NODE_ENV === "development") console.error(message);

  client.close(1008, message);
}

//Temporary incremental id for sockets
let count = 0;

/**
 * This route should only be used when the client has a valid auth cookie
 */
export async function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  //Apply a basic id to socket for identification purposes during development
  client.id = String(count);
  count++;

  const { auth_session } = parseCookie(request.headers.cookie ?? "");
  const { user } = await lucia.validateSession(auth_session); //TODO: this could call 'fresh' on lucia session, but we cannot set cookie

  if (user) {
    wsSocketRegistry.register(client, user.id);
    ActivityManager._eventHooks.onHeartbeat(user.id);
  }

  const onWSMessage = (m: MessageEvent) => {
    onWsClientToServerMessage(client)(m.data.toString());
  };

  client.addEventListener("message", onWSMessage);

  client.once("close", () => {
    client.removeEventListener("message", onWSMessage);
  });
}

export function GET() {}

export function POST() {}
