
import { generateRandomSudoku } from "#shared/utils/sudoku";
import db from "#server/db";
import * as schema from "#server/db/schema";

import { and, asc, desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";


export class GameService {
  static async getTodaysPuzzle(difficulty: SudokuDifficulty): Promise<typeof schema.dailyPuzzles.$inferSelect> {
    try {
      const today = new Date().toISOString().split('T')[0]!; // YYYY-MM-DD

      // Check if puzzle exists for today
      let puzzle = await this.getPuzzleByDate(today);

      // If no puzzle for today, generate one
      if (!puzzle) {
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

      return puzzle!;

    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get today's puzzle`);
    }
  }

  static async getPuzzleByDate(date: string) {
    console.log("getPuzzleByDate", date)
    const result = await db
      .select()
      .from(schema.dailyPuzzles)
      .where(eq(schema.dailyPuzzles.date, date))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  static async getPuzzle(puzzleId: string) {
    const result = await db
      .select()
      .from(schema.dailyPuzzles)
      .where(eq(schema.dailyPuzzles.id, puzzleId))
      .limit(1)

    return result[0] ? result[0] : null
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
      console.error('getUserProgress error', error)
      throw new Error("Failed to get user progress");
    }
  }

  static async completePuzzle(userId: string, puzzleId: string): Promise<typeof schema.gameProgress.$inferSelect | null> {
    const currentProgress = await this.getUserProgress(userId, puzzleId);

    if (!currentProgress) return null;

    try {
      return await this.saveProgress(userId, puzzleId, {
        ...currentProgress,
        completedAt: new Date(),
        updatedAt: new Date(),
        isCompleted: true,
      })
    } catch (error) {
      console.log('completePuzzle error:', error);
      throw new Error("Failed to set puzzle as completed")

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
        ...existing,
        ...data,
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

  static async getLeaderboard(type: "global" | "server", date: string, orderBy: "speed" | "moves" | "mistakes", userId?: string, guildId?: string) {
    const puzzle = await this.getPuzzleByDate(date);

    if (!puzzle) return;

    let order;

    switch (orderBy) {
      case "speed":
      default:
        order = asc(schema.gameProgress.timeSpent)
        break;
      case "moves":
        order = asc(schema.gameProgress.moves)
        break;
      case "mistakes":
        order = asc(schema.gameProgress.mistakes)
    }

    // FIX: global returns nothing
    let dbReq = db
      .select({
        timeSpent: schema.gameProgress.timeSpent,
        moves: schema.gameProgress.moves,
        mistakes: schema.gameProgress.mistakes,
        user: {
          id: schema.users.id,
          username: type == 'server' ? schema.userGuildMemberships.discordUsername : schema.users.discordUsername
        }
      })
      .from(schema.gameProgress)
      .innerJoin(schema.dailyPuzzles, eq(schema.dailyPuzzles.id, schema.gameProgress.puzzleId))
      .innerJoin(schema.users, eq(schema.users.id, schema.gameProgress.userId))
      .where(and(
        eq(schema.dailyPuzzles.date, date),
        eq(schema.gameProgress.isCompleted, true)
      ))
      .$dynamic()

    if (type === 'server' && guildId && userId) {
      dbReq = dbReq
        .innerJoin(schema.userGuildMemberships, and(
          eq(schema.userGuildMemberships.userId, userId),
          eq(schema.userGuildMemberships.guildId, guildId)
        ))

    }

    if (order) {
      dbReq = dbReq.orderBy(order)
    }

    dbReq = dbReq.limit(100);

    const reqResult = await dbReq


    return reqResult;
  }
}
