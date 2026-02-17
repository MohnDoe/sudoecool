import { GameService } from "#server/services/game.service";
import { requireDiscordAuth } from "#server/utils/discordAuth";

export default defineEventHandler(async (event) => {
  const session = await requireDiscordAuth(event);
  const userId = session.user!.id;
  const puzzle = await GameService.getTodaysPuzzle("easy");

  const progress = await GameService.getUserProgress(userId, puzzle.id);


  return {
    daily: {
      id: puzzle.id,
      date: puzzle.date,
      puzzle: puzzle.puzzle,
      difficulty: puzzle.difficulty
    },
    progress
  }
})
