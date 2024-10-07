import { lucia } from "~/lib/lucia/lucia";
import { google } from "~/lib/lucia/arctic/google.arctic";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { db } from "~/lib/drizzle/db";
import { accountConnections, users } from "~/lib/drizzle/auth.schema";
import { and, eq } from "drizzle-orm";

const GOOGLEPROVIDERID = "GOOGLE";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const stateCookie = cookies().get("google_oauth_state") ?? null;
  const codeVerifierCookie = cookies().get("code_verifier") ?? null;

  if (
    !code ||
    !state ||
    !stateCookie ||
    state !== stateCookie.value ||
    !codeVerifierCookie
  ) {
    return new Response("Invalid request #1", {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      codeVerifierCookie.value,
    );

    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );
    const googleUser = await googleUserResponse.json();

    if (!googleUser.email || !googleUser.name) {
      return new Response("Invalid request #2", {
        status: 400,
      });
    }

    const [existingUser] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .leftJoin(accountConnections, eq(users.id, accountConnections.userID))
      .where(
        and(
          eq(accountConnections.provider, GOOGLEPROVIDERID),
          eq(accountConnections.providerAccountId, googleUser.sub),
        ),
      );

    if (existingUser) {
      // Log in existing user
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = await lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // Sign up new user
    const newUserID = generateId(15);

    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: newUserID,
        email: googleUser.email,
        name: googleUser.name,
        image: googleUser.picture,
      }),
        await tx.insert(accountConnections).values({
          userID: newUserID,
          provider: GOOGLEPROVIDERID,
          providerAccountId: googleUser.sub,
        });
    });

    const session = await lucia.createSession(newUserID, {
      email: googleUser.email,
    });
    const sessionCookie = await lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      //invalid code
      return new Response("Invalid request #3", { status: 400 });
    }

    return new Response("Server Error", {
      status: 500,
    });
  }
}
