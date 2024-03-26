import { Session, User } from "lucia";
import { db } from "~/lib/drizzle/db";
import { getLuciaSession } from "~/lib/lucia/util.lucia";

const createInnerTRPCContext = (session: Session | null, user: User | null) => {
  return {
    user: user,
    session: session,
    db,
  };
};

export const createTRPCContext = async () => {
  const { session, user } = await getLuciaSession();

  return createInnerTRPCContext(session, user);
};
