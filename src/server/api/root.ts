import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod"

export const appRouter = createTRPCRouter({
  firstproc: publicProcedure.query(() => "test response")
});

// export type definition of API
export type AppRouter = typeof appRouter;
