import { lucia } from "~/lib/lucia/lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const AUTH_COOKIE = cookies().get("auth_session");

  if (AUTH_COOKIE !== undefined)
    await lucia.invalidateSession(AUTH_COOKIE.value);

  return Response.redirect(new URL("", req.nextUrl.origin));
}
