import { createTRPCRouter, publicProcedure } from "./trpc";
import { trpcGameRouter } from "~/server/api/routers/game/game.trpc";
import { trpcLobbyRouter } from "~/server/api/routers/lobby/lobby.trpc";

export const appRouter = createTRPCRouter({
  game: trpcGameRouter,
  lobby: trpcLobbyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
