import { Session, User } from "lucia";
import { db } from "~/lib/drizzle/db";
import { getServerSession } from "~/lib/lucia/util.lucia";

const createInnerTRPCContext = (session: Session | null, user: User | null) => {
  return {
    user: user,
    session: session,
    db,
  };
};

export const createTRPCContext = async () => {
  const { session, user } = await getServerSession();

  return createInnerTRPCContext(session, user);
};
