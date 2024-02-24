import { t, createContext } from "./init.trpc"
import { trpcApiRouter } from './routers/api/api.trpc.router';
import { createExpressMiddleware } from "@trpc/server/adapters/express"

export const appRouter = t.router({
    a:trpcApiRouter
});

export const trpcExpressMiddleware = createExpressMiddleware({
    router:appRouter,
    createContext
})

export type AppRouter = typeof appRouter;