import {
  check,
  pgEnum,
  pgTable,
  primaryKey,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { exists, not, relations } from "drizzle-orm";
import { users } from "~/lib/drizzle/auth.schema";

// ENUMS
export const drizzleFriendStatusEnum = pgEnum("status", [
  "pending",
  "confirmed",
]);

// TABLES
export const friends = pgTable(
  "friends",
  {
    user1_ID: varchar("user1")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    user2_ID: varchar("user2")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: drizzleFriendStatusEnum("status"),
    pending_accept: varchar("pending_accept"),
  },
  (t) => ({
    compoundKey: primaryKey({ columns: [t.user1_ID, t.user2_ID] }),
    unq: unique().on(t.user1_ID, t.user2_ID),
  }),
);

// RELATIONS
export const friendsRelations = relations(friends, ({ one }) => ({
  user1: one(users, {
    fields: [friends.user1_ID],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [friends.user2_ID],
    references: [users.id],
    relationName: "user2",
  }),
}));
