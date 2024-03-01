import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { GetServerSidePropsContext } from "next";
import { getServerSession, DefaultSession, NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google"

import { env } from "~/env";
import { db } from "~/lib/drizzle/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string,
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as Adapter,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      }
    })
  },
  providers: [
    GoogleProvider({
      clientId: env.OAUTH_GOOGLE_CLIENTID,
      clientSecret: env.OAUTH_GOOGLE_CLIENTSECRET,
    })
  ]
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"],
  res: GetServerSidePropsContext["res"],
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}