/**
 * Applies the SQL migrations in ./drizzle to the database at POSTGRES_URL.
 * Safe to run on every start: drizzle records applied migrations and skips them.
 *
 * Create a new migration after changing the schema:
 *   yarn db:generate
 */
// Loads .env when run on your machine (yarn dev setup). In the Docker image there
// is no .env, so this does nothing and POSTGRES_URL comes from the container.
import "dotenv/config";
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
