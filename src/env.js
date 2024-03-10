import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_POSTGRES_URL_HERE"),
        "You forgot to change the default URL"
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),  
    OAUTH_GOOGLE_CLIENTID:z.string(),
    OAUTH_GOOGLE_CLIENTSECRET:z.string(),
  },

  client: {
    
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    OAUTH_GOOGLE_CLIENTID: process.env.OAUTH_GOOGLE_CLIENTID,
    OAUTH_GOOGLE_CLIENTSECRET: process.env.OAUTH_GOOGLE_CLIENTSECRET,
  },
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
