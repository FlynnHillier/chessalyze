import { TRPCError } from "@trpc/server";
import { AuthPermissions } from "~/constants/auth";
import { protectedProcedure } from "~/server/api/trpc";

export const devProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.permissions < AuthPermissions.ADMIN) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have administrator priviliges.",
    });
  }

  return next();
});
