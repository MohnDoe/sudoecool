import { GameService } from "#server/services/game.service";
import { checkPuzzleAgainstSolution } from "#shared/utils/sudoku";
import { z } from "zod/v4";

const bodySchema = z.object({
  puzzleId: z.string(),
  board: z.string().length(TOTAL_CELLS)
})

export default defineEventHandler(async (event) => {
  const session = await requireDiscordAuth(event);
  const userId = session.user!.id;

  const body = await readValidatedBody(event, bodySchema.safeParse);

  if (!body.success) {
    throw body.error.issues;
  }

  const { puzzleId, board } = body.data;

  const puzzle = await GameService.getPuzzle(puzzleId);

  if (!puzzle) {
    throw createError({ statusCode: 404, message: 'This Sudoku does not exist !' });
  }

  const verified = checkPuzzleAgainstSolution(board, puzzle.solution);

  if (verified) {
    try {
      const finalProgress = await GameService.completePuzzle(userId, puzzleId);
      return {
        verified: true,
        stats: finalProgress
      }
    } catch (error) {
      throw createError({ statusCode: 500, message: "Could not mark this as complete" })
    }
  } else {
    return {
      verified: false,
      stats: null
    }
  }


})
