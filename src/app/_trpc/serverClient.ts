import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/context";
import { createCallerFactory } from "~/server/api/trpc";

const createCaller = createCallerFactory(appRouter);

export const serverClient = createCaller(await createTRPCContext());
