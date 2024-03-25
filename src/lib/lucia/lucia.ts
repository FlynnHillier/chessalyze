import { Lucia } from "lucia";
import { adapter } from "~/lib/lucia/adapter";
import { env } from "~/env";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (attributes) => {
    //map out custom session attributes
    return {};
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
  interface DatabaseSessionAttributes {} //Custom session attributes here (all columns are not automatically exposed)
}
