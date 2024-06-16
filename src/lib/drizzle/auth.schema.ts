import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { friends } from "~/lib/drizzle/social.schema";

export const users = pgTable("user", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  image: text("image"),
  permissions: integer("permission").notNull().default(0),
});

export const sessions = pgTable("session", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires", { mode: "date" }).notNull(),
});

export const accountConnections = pgTable(
  "account_connections",
  {
    userID: varchar("id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("type").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

// RELATIONS
export const userRelations = relations(users, ({ many }) => ({
  friends: many(friends),
}));
