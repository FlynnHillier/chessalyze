import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { parse as parseCookie } from "cookie";
import { env } from "~/env";
import { lucia } from "~/lib/lucia/lucia";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";

function closeConnection(client: WebSocket, reason?: string): void {
  const message = `Closing socket connection${reason ? `: '${reason}'` : ""}`;

  if (env.NODE_ENV === "development") console.error(message);

  client.close(1008, message);
}

/**
 * This route should only be used when the client has a valid auth cookie
 */
export async function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  const { auth_session } = parseCookie(request.headers.cookie ?? "");
  if (!auth_session) {
    return closeConnection(client, "no session cookie present");
  }

  const luciaResponse = await lucia.validateSession(auth_session); //TODO: this could call 'fresh' on lucia session, but we cannot set cookie
  if (luciaResponse.user === null || luciaResponse.session === null) {
    return closeConnection(client, "invalid session cookie");
  }

  const { user, session } = luciaResponse;
  wsSocketRegistry.register(user.id, client);

  if (env.NODE_ENV === "development")
    console.log(`Registered socket connection for user: ${user.email}`);
}

export function GET() {}

export function POST() {}
