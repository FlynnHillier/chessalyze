"use server";

import { cookies } from "next/headers";
import { Session, User } from "lucia";
import { lucia } from "~/lib/lucia/lucia";

/**
 * Custom function to handle reading lucia session data
 */
export async function getLuciaSession(): Promise<
  | {
      user: null;
      session: null;
    }
  | {
      user: User;
      session: Session;
    }
> {
  const sessionCookie = cookies().get("auth_session");

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  const luciaResponse = await lucia.validateSession(sessionCookie.value);

  const { session, user } = luciaResponse;

  if (session && session.fresh) {
    //set new cookie
    const newSessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(newSessionCookie.name, newSessionCookie.value);
  }

  return luciaResponse;
}
