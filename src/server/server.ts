/**
 * This is the production implementation of our next app server.
 * It integrates wss support into next app.
 * In development 'wssDevServer.ts' is ran concurrently with our next app.
 */
import next from "next";
import { createServer } from "node:http";
import { parse } from "node:url";
import type { Socket } from "net";

import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";

import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/context";
import { env } from "../env";

const PORT = env.PORT || 5000;
const DEV = process.env.NODE_ENV !== "production";
const APP = next({ dev: env.NODE_ENV !== "production" });
const handle = APP.getRequestHandler();

void APP.prepare().then(() => {
  const server = createServer(async (req, res) => {
    if (!req.url) return;
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });
  const wss = new WebSocketServer({ server });
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: createTRPCContext,
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handler.broadcastReconnectNotification();
  });

  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket as Socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // Keep the next.js upgrade handler from being added to our custom server
  // so sockets stay open even when not HMR.
  const originalOn = server.on.bind(server);
  server.on = function (event, listener) {
    return event !== "upgrade" ? originalOn(event, listener) : server;
  };
  server.listen(PORT);

  console.log(
    `> Server listening at http://localhost:${PORT} as ${
      DEV ? "development" : process.env.NODE_ENV
    }`,
  );
});
