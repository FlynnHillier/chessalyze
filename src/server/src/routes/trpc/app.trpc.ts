import { t, createContext } from "./init.trpc"
import { trpcApiRouter } from './api/api.trpc'
import { createExpressMiddleware } from "@trpc/server/adapters/express"
import * as i from "./../../types/custom/express/index"
import * as h from "./../../types/custom/http/index"

export const appRouter = t.router({
    a:trpcApiRouter
});

export const trpcExpressMiddleware = createExpressMiddleware({
    router:appRouter,
    createContext
})

export type AppRouter = typeof appRouter;