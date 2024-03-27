/**
 * This is the production implementation of our next app server.
 * It integrates wss support into next app.
 * In development 'wssDevServer.ts' is ran concurrently with our next app.
 */
import next from "next";
import { createServer } from "node:http";
import { parse } from "node:url";

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
  const wss = new WebSocketServer({ noServer: true });
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
    if (!req.url) return;

    const { pathname } = parse(req.url, true);
    if (pathname !== "/_next/webpack-hmr") {
      // Only handle non next-js upgrade requests
      wss.handleUpgrade(req, socket, head, function done(ws) {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (socket) => {
    console.log(`++ socket connection (${+wss.clients.size})`);

    socket.on("close", () => {
      console.log(`-- socket closed (${+wss.clients.size})`);
    });
  });

  server.listen(PORT);

  console.log(
    `> Server listening at http://localhost:${PORT} as ${
      DEV ? "development" : process.env.NODE_ENV
    }`,
  );
});
