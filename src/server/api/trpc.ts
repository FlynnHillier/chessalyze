import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createTRPCContext } from "./context";

export class TRPCStandardNoAuthError extends TRPCError {
  constructor(
    message: string = "you must be logged in to access this content",
  ) {
    super({ code: "UNAUTHORIZED", message });
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createTRPCRouter = t.router;

export const createTRPCMiddleware = t.middleware;

export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    throw new TRPCStandardNoAuthError();
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session },
      user: {
        ...ctx.user,
      },
    },
  });
});
