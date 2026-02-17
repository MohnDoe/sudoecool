import { relations } from "drizzle-orm/_relations";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid('id').defaultRandom().primaryKey(),
  discordId: text('discord_id').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Daily puzzle configuration (one per day)
export const dailyPuzzles = pgTable('daily_puzzles', {
  id: uuid('id').defaultRandom().primaryKey(),
  date: text('date').notNull().unique(), // Format: YYYY-MM-DD
  puzzle: jsonb('puzzle').notNull(), // Sudoku grid as JSON
  solution: jsonb('solution').notNull(), // Solution grid as JSON
  difficulty: text('difficulty').notNull(), // easy, medium, hard
  seed: text('seed').notNull(), // Random seed for generation
  createdAt: timestamp('created_at').defaultNow(),
});

// User game progress (auto-saved on each move)
export const gameProgress = pgTable('game_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  puzzleId: uuid('puzzle_id')
    .notNull()
    .references(() => dailyPuzzles.id, { onDelete: 'cascade' }),
  currentState: jsonb('current_state').notNull(), // Current grid state
  moves: integer('moves').notNull().default(0), // Number of moves made
  hints: integer('hints').notNull().default(0), // Hints used
  timeSpent: integer('time_spent').notNull().default(0), // Seconds
  isCompleted: boolean('is_completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  lastSavedAt: timestamp('last_saved_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Completed game results (final scores)
export const gameResults = pgTable('game_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  puzzleId: uuid('puzzle_id')
    .notNull()
    .references(() => dailyPuzzles.id, { onDelete: 'cascade' }),
  timeTaken: integer('time_taken').notNull(), // Total seconds
  moves: integer('moves').notNull(),
  hints: integer('hints').notNull(),
  difficulty: text('difficulty').notNull(),
  score: integer('score').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  games: many(gameResults),
  progress: many(gameProgress),
}));

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
  user: one(users, {
    fields: [gameResults.userId],
    references: [users.id],
  }),
  puzzle: one(dailyPuzzles, {
    fields: [gameResults.puzzleId],
    references: [dailyPuzzles.id],
  }),
}));

export const gameProgressRelations = relations(gameProgress, ({ one }) => ({
  user: one(users, {
    fields: [gameProgress.userId],
    references: [users.id],
  }),
  puzzle: one(dailyPuzzles, {
    fields: [gameProgress.puzzleId],
    references: [dailyPuzzles.id],
  }),
}));
