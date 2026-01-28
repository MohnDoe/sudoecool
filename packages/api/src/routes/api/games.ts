import { AuthBindings, authMiddleware } from "@/middleware/auth";
import { GameService } from "@/services/game.service";
import { SudokuDifficulty } from "@sudoecool/shared";
import { Hono } from "hono";

const router = new Hono<AuthBindings>().use(authMiddleware);

router.get('/daily', async (c) => {
  const userId = c.get('userId');
  const difficulty = c.req.query('difficulty') || "medium"


  const puzzle = await GameService.getTodaysPuzzle(difficulty as SudokuDifficulty)

  // TODO: get progress from user
  const progress = await GameService.getUserProgress(userId, puzzle.id);


  return c.json({
    daily: {
      id: puzzle.id,
      date: puzzle.date,
      puzzle: puzzle.puzzle,
      difficulty: puzzle.difficulty
    },
    progress: progress ? {
      currentState: progress.currentState,
      moves: progress.moves,
      hints: progress.hints,
      timeSpent: progress.timeSpent,
      isCompleted: progress.isCompleted,
      lastSavedAt: progress.lastSavedAt,
    } : null
  })
})

router.post('/progress', async (c) => {
  console.log('/api/games/progress');
  const userId = c.get('userId');
  const { puzzleId, grid, moves, hints, timeSpent, isCompleted } = await c.req.json();

  try {
    const progress = await GameService.saveProgress(userId, puzzleId, {
      grid,
      moves,
      hints,
      timeSpent,
      isCompleted,
    });

    return c.json({
      success: true,
      progress: {
        id: progress.id,
        lastSavedAt: progress.lastSavedAt,
      },
    });
  } catch (error) {
    console.error('Save progress error:', error);
    return c.json({ error: 'Failed to save progress' }, 500);
  }
});

export default router;
