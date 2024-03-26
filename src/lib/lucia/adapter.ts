import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "~/lib/drizzle/db";
import { users, sessions } from "~/lib/drizzle/schema";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
