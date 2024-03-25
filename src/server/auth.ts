//TODO: migrate this to use lucia instead of next auth.
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 */
export const getServerAuthSession = () => {
  //getServerSession(authOptions);
};
