import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";

export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  console.log("Websocket connection");
}

export function GET() {}

export function POST() {}
