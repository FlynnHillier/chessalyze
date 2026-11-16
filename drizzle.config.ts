// drizzle-kit runs outside Next.js, so nothing else loads .env for it.
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { env } from "~/env";

export default defineConfig({
  schema: "./src/lib/drizzle/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: env.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
});
