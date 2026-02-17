
import { generateRandomSudoku } from "#shared/utils/sudoku";
import db from "#server/db";
import * as schema from "#server/db/schema";

import { and, DrizzleError, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";


export class GameService {
  static async getTodaysPuzzle(difficulty: SudokuDifficulty): Promise<typeof schema.dailyPuzzles.$inferSelect> {
    try {
      const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD

      // Check if puzzle exists for today
      let puzzle = await db
        .select()
        .from(schema.dailyPuzzles)
        .where(eq(schema.dailyPuzzles.date, today))
        .limit(1);

      // If no puzzle for today, generate one
      if (puzzle.length === 0) {
        const seed = `${today}-${difficulty}`;
        const generated = generateRandomSudoku(difficulty);

        const newPuzzle: typeof schema.dailyPuzzles.$inferInsert = {
          id: uuid(),
          date: today,
          puzzle: generated.puzzle,
          solution: generated.solution,
          difficulty,
          seed,
          createdAt: new Date(),
        };

        const result = await db
          .insert(schema.dailyPuzzles)
          .values(newPuzzle)
          .returning();

        return result[0]!;
      }

      return puzzle[0]!;
    } catch (error) {
      throw new Error(`Failed to get today's puzzle: ${error}`);
    }
  }

  static async getUserProgress(userId: string, puzzleId: string): Promise<typeof schema.gameProgress.$inferSelect | null> {
    try {
      const progress = await db
        .select()
        .from(schema.gameProgress)
        .where(and(
          eq(schema.gameProgress.userId, userId),
          eq(schema.gameProgress.puzzleId, puzzleId)
        ))
        .limit(1);

      return progress.length > 0 ? progress[0]! : null
    } catch (error) {
      throw new Error("Failed to get user progress", error as DrizzleError);
    }
  }

  static async saveProgress(
    userId: string,
    puzzleId: string,
    data: typeof schema.gameProgress.$inferInsert
  ): Promise<typeof schema.gameProgress.$inferSelect> {
    try {
      const now = new Date();

      // Check if progress already exists
      const existing = await this.getUserProgress(userId, puzzleId);
      const updateData = {
        currentState: data.currentState,
        moves: data.moves,
        hints: data.hints,
        timeSpent: data.timeSpent,
        isCompleted: data.isCompleted || false,
        completedAt: data.isCompleted ? now : existing?.completedAt ?? null,
        lastSavedAt: now,
        updatedAt: now,
      }

      if (existing) {
        // Update existing progress
        const updated = await db
          .update(schema.gameProgress)
          .set(updateData)
          .where(eq(schema.gameProgress.id, existing.id))
          .returning();

        return updated[0]!;
      } else {
        // Create new progress entry
        const newProgress = {
          ...updateData,
          id: uuid(),
          userId,
          puzzleId,
        };

        const created = await db
          .insert(schema.gameProgress)
          .values(newProgress)
          .returning();

        return created[0]!;
      }
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to save progress: ${error}`);
    }
  }
}
