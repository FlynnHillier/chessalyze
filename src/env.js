import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Use dotenv to load .env variables for createEnv to validate.
 *
 * This is necessary because if app is launched in development mode via executing ./src/server/server.ts
 * createEnv will not load .env variables in themselves.
 */
import { config } from "dotenv";
config();

export const env = createEnv({
  server: {
    POSTGRES_URL: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_POSTGRES_URL_HERE"),
        "You forgot to change the default URL",
      ),
    OAUTH_GOOGLE_CLIENTID: z.string(),
    OAUTH_GOOGLE_CLIENTSECRET: z.string(),
    OAUTH_GOOGLE_REDIRECT_URI: z.string(),
  },

  client: {},

  shared: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.preprocess((p) => Number(p), z.number()).default(3000),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    OAUTH_GOOGLE_CLIENTID: process.env.OAUTH_GOOGLE_CLIENTID,
    OAUTH_GOOGLE_CLIENTSECRET: process.env.OAUTH_GOOGLE_CLIENTSECRET,
    OAUTH_GOOGLE_REDIRECT_URI: process.env.OAUTH_GOOGLE_REDIRECT_URI,
    NEXT_PUBLIC_PORT: process.env.NEXT_PUBLIC_PORT,
  },
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
