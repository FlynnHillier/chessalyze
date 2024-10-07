import { generateState, generateCodeVerifier } from "arctic";
import { google } from "~/lib/lucia/arctic/google.arctic";
import { cookies } from "next/headers";
import { env } from "~/env";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  cookies().set("google_oauth_state", state, {
    path: "/",
    // secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 2,
    sameSite: "lax",
  });

  cookies().set("code_verifier", codeVerifier, {
    httpOnly: true,
    // secure: env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 2,
    path: "/",
  });

  return Response.redirect(url);
}
