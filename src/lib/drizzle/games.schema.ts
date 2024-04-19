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
import {
  PROMOTIONPIECE,
  TILEIDS,
  TERMINATIONS,
  COLOR,
  PIECE,
} from "~/constants/game";
import { relations } from "drizzle-orm";

// ENUMS
export const drizzleEnumTile = pgEnum("tile", TILEIDS);
export const drizzleEnumPiece = pgEnum("piece", PIECE);
export const drizzleEnumPromotionPiece = pgEnum(
  "promotion_piece",
  PROMOTIONPIECE,
);
export const drizzleEnumTerminations = pgEnum("termination", TERMINATIONS);
export const drizzleEnumColor = pgEnum("color", COLOR);

// TABLES

export const games = pgTable("games", {
  p_white_id: varchar("p_white").references(() => users.id, {
    onDelete: "set null",
  }),
  p_black_id: varchar("p_black").references(() => users.id, {
    onDelete: "set null",
  }),
  id: varchar("id").notNull().primaryKey(),
  t_start: bigint("t_start", { mode: "number" }).notNull(),
  t_end: bigint("t_start", { mode: "number" }).notNull(),
  t_duration: bigint("t_start", { mode: "number" }).notNull(),
});

export const moves = pgTable(
  "moves",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    fen: text("fen").notNull(),
    turn: integer("turn").notNull(),
    initiator_pid: varchar("initiator_id").references(() => users.id, {
      onDelete: "set null",
    }),
    initiator_color: drizzleEnumColor("initiator_color").notNull(),
    piece: drizzleEnumPiece("piece").notNull(),
    source: drizzleEnumTile("source").notNull(),
    target: drizzleEnumTile("target").notNull(),
    promotion: drizzleEnumPromotionPiece("promotion"),
    t_duration: bigint("t_duration", { mode: "number" }).notNull(),
    t_timestamp: bigint("t_timestamp", { mode: "number" }).notNull(),
    t_w_remaining: bigint("t_w_remaining", { mode: "number" }),
    t_b_remaining: bigint("t_b_remaining", { mode: "number" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameID, t.turn] }),
    unq: unique().on(t.gameID, t.turn),
  }),
);

// RELATIONS
export const movesRelations = relations(moves, ({ one }) => ({
  game: one(games, { fields: [moves.gameID], references: [games.id] }),
  initiator: one(users, {
    fields: [moves.initiator_pid],
    references: [users.id],
  }),
}));

export const gameRelations = relations(games, ({ many, one }) => ({
  moves: many(moves),
  player_white: one(users, {
    fields: [games.p_white_id],
    references: [users.id],
  }),
  player_black: one(users, {
    fields: [games.p_black_id],
    references: [users.id],
  }),
}));
