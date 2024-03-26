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
    return {
      id: attributes.id,
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
  interface DatabaseSessionAttributes {
    id: string;
    email: string;
  } //Custom session attributes here (all columns are not automatically exposed)
}
