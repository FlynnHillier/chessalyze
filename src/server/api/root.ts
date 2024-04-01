import { createTRPCRouter } from "./trpc";
import { trpcGameRouter } from "~/server/api/routers/game/game.trpc";
import { trpcLobbyRouter } from "~/server/api/routers/lobby/lobby.trpc";
import { trpcDevRouter } from "~/server/api/routers/dev/dev.trpc";

export const appRouter = createTRPCRouter({
  game: trpcGameRouter,
  lobby: trpcLobbyRouter,
  dev: trpcDevRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
