import { Lucia, User } from "lucia";
import { adapter } from "~/lib/lucia/adapter";
import { env } from "~/env";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getSessionAttributes: (attributes) => {
    // Map colums from session table to session object
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      // Map colums from user table to user object
      email: attributes.email,
      image: attributes.image,
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
  interface DatabaseSessionAttributes {}
  interface DatabaseUserAttributes {
    email: string;
    image: string;
    name: string;
  }
}
