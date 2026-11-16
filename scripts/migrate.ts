/**
 * Applies the SQL migrations in ./drizzle to the database at POSTGRES_URL.
 * Safe to run on every start: drizzle records applied migrations and skips them.
 *
 * Create a new migration after changing the schema:
 *   yarn drizzle-kit generate:pg --config=./drizzle.config.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) throw new Error("POSTGRES_URL is not set");

async function main(connectionString: string) {
  const pool = new Pool({ connectionString });
  await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}

main(connectionString).catch((e) => {
  console.error(e);
  process.exit(1);
});
