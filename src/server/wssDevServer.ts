/**
 * This file is ran when in development mode, to host the wss server required by trpc to support subscriptions.
 * It is a server seperate from the next app.
 * In production & post-build, we can use ./server.ts instead to host a better configured server for production.
 */
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { createTRPCContext } from "~/server/api/context";
import { appRouter } from "~/server/api/root";
import { env } from "~/env";

const PORT = env.WSS_PORT ?? 3001;

const wss = new WebSocketServer({
  port: PORT,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createTRPCContext,
});

wss.on("connection", (ws) => {
  console.log(`++ WSS Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`-- WSS Connection (${wss.clients.size})`);
  });
});
console.log(`✅ WebSocket Server listening on ws://localhost:${PORT}`);

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
