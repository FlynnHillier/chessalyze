import { getServerAuthSession } from "~/server/auth"
import { Session } from "next-auth"
import { db } from "~/lib/drizzle/db"



interface CreateContextOptions {
  session: Session | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async () => {
  // const session = await getServerAuthSession({ req, res })

  return createInnerTRPCContext({
    // session,
    session: {
      user: {
        id: "testid"
      },
      expires: "test expires"
    }
  })
}