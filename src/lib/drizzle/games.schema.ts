import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
  primaryKey,
  bigint,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "@lib/drizzle/auth.schema";
import { PROMOTIONPIECE, TILEIDS } from "~/constants/game";

// ENUMS
export const drizzleEnumTile = pgEnum("tile", TILEIDS);
export const drizzleEnumPromotionPiece = pgEnum(
  "promotion_piece",
  PROMOTIONPIECE,
);

// TABLES

export const games = pgTable("games", {
  p_white: varchar("p_white").references(() => users.id, {
    onDelete: "set null",
  }),
  p_black: varchar("p_black").references(() => users.id, {
    onDelete: "set null",
  }),
  id: varchar("id").notNull().primaryKey(),
});

export const moves = pgTable(
  "moves",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    turn: integer("turn").notNull(),
    fen: text("fen").notNull(),
    source: drizzleEnumTile("source").notNull(),
    target: drizzleEnumTile("target").notNull(),
    promotion: drizzleEnumPromotionPiece("promotion"),
    t_duration: bigint("t_duration", { mode: "number" }),
    t_w_remaining: bigint("t_w_remaining", { mode: "number" }),
    t_b_remaining: bigint("t_b_remaining", { mode: "number" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameID, t.turn] }),
    unq: unique().on(t.gameID, t.turn),
  }),
);
