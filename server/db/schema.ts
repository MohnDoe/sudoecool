import { pgTable, uuid, text, timestamp, varchar, jsonb, integer, boolean, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const dailyPuzzles = pgTable("daily_puzzles", {
  id: uuid().defaultRandom().primaryKey(),
  date: text().notNull(),
  puzzle: varchar({ length: 81 }).notNull(),
  solution: varchar({ length: 81 }).notNull(),
  difficulty: text().notNull(),
  seed: text().notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => [
  unique("daily_puzzles_date_key").on(table.date),]);

export const gameProgress = pgTable("game_progress", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  puzzleId: uuid("puzzle_id").notNull().references(() => dailyPuzzles.id, { onDelete: "cascade" }),
  currentState: jsonb("current_state").notNull(),
  moves: integer().default(0).notNull(),
  notes: integer().default(0).notNull(),
  hints: integer().default(0).notNull(),
  mistakes: integer().default(0).notNull(),
  timeSpent: integer("time_spent").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  lastSavedAt: timestamp("last_saved_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});


export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  discordId: text("discord_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => [
  unique("users_discord_id_key").on(table.discordId),]);
