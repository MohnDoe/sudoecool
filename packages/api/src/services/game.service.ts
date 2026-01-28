import { db } from "@/db";
import { dailyPuzzles, gameProgress } from "@/db/schema";
import { Cell, generateRandomSudoku, SudokuDifficulty } from "@sudoecool/shared";
import { and, DrizzleError, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// interface IGameService {
//   getTodaysPuzzle(): Promise<typeof dailyPuzzles.$inferSelect>;
//   getUsersProgress(userId: string, puzzleId: string): Promise<any>;
//   saveUserProgress(userId: string, puzzleId: string, state: {
//     grid: number[][];
//     status: "ongoing" | "completed" | "failed";
//     timestamp: number;
//     mistakes: number;
//     moves: number;
//     hints: number;
//   }): Promise<any>
// }

export class GameService {
  static async getTodaysPuzzle(difficulty: SudokuDifficulty): Promise<typeof dailyPuzzles.$inferSelect> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Check if puzzle exists for today
      let puzzle = await db
        .select()
        .from(dailyPuzzles)
        .where(eq(dailyPuzzles.date, today))
        .limit(1);

      // If no puzzle for today, generate one
      if (puzzle.length === 0) {
        const seed = `${today}-${difficulty}`;
        const generated = generateRandomSudoku(difficulty);

        const newPuzzle = {
          id: uuid(),
          date: today,
          puzzle: generated.puzzle,
          solution: generated.solution,
          difficulty,
          seed,
          createdAt: new Date(),
        };

        const result = await db
          .insert(dailyPuzzles)
          .values(newPuzzle)
          .returning();

        return result[0];
      }

      return puzzle[0];
    } catch (error) {
      throw new Error(`Failed to get today's puzzle: ${error}`);
    }
  }

  static async getUserProgress(userId: string, puzzleId: string): Promise<typeof gameProgress.$inferSelect | null> {
    try {
      const progress = await db
        .select()
        .from(gameProgress)
        .where(and(
          eq(gameProgress.userId, userId),
          eq(gameProgress.puzzleId, puzzleId)
        ))
        .limit(1);

      return progress.length > 0 ? progress[0] : null
    } catch (error) {
      throw new Error("Failed to get user progress", error as DrizzleError);
    }
  }

  static async saveProgress(
    userId: string,
    puzzleId: string,
    data: {
      grid: Cell[];
      moves: number;
      hints: number;
      timeSpent: number;
      isCompleted?: boolean;
    }
  ): Promise<typeof gameProgress.$inferInsert> {
    try {
      const now = new Date();

      // Check if progress already exists
      const existing = await this.getUserProgress(userId, puzzleId);
      const updateData = {
        currentState: data.grid,
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
          .update(gameProgress)
          .set(updateData)
          .where(eq(gameProgress.id, existing.id))
          .returning();

        return updated[0];
      } else {
        // Create new progress entry
        const newProgress = {
          ...updateData,
          id: uuid(),
          userId,
          puzzleId,
        };

        const created = await db
          .insert(gameProgress)
          .values(newProgress)
          .returning();

        return created[0];
      }
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to save progress: ${error}`);
    }
  }
}
