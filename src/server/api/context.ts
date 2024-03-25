import { Session } from "next-auth";
import { db } from "~/lib/drizzle/db";

interface CreateContextOptions {
  session: Session | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async () => {
  return createInnerTRPCContext({
    session: {
      user: undefined,
      expires: "test expires",
    },
  });
};
