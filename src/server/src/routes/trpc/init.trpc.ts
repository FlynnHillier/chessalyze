import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"

export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions) => ({});

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();