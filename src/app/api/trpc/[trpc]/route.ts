import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/context";

/**
 * redirect nextjs trpc client requests to server
 */
const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext
  })
}

export { handler as GET, handler as POST }