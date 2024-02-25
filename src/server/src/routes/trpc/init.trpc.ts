import { initTRPC } from '@trpc/server';
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"

export const createContext = ({
    req,
    res,
}: CreateExpressContextOptions) => ({
        user:req.user
    });

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();