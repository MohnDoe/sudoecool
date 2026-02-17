import { GameService } from "#server/services/game.service";
import { requireDiscordAuth } from "#server/utils/discordAuth";
import { gameProgress } from "#server/db/schema";

import { createInsertSchema } from "drizzle-orm/zod";
import { z } from "zod/v4";

const progressInsertSchema = createInsertSchema(gameProgress);
export type PostProgressBody = z.infer<typeof progressInsertSchema>;

export default defineEventHandler(async (event) => {
  const session = await requireDiscordAuth(event);
  const userId = session.user!.id;

  const result = await readValidatedBody(event, progressInsertSchema.safeParse);


  if (!result.success) {
    throw result.error.issues;
  }

  try {
    const progress = await GameService.saveProgress(userId!, result.data.puzzleId, result.data);

    return {
      success: true,
      progress: {
        id: progress.id,
        lastSavedAt: progress.lastSavedAt,
      },
    };
  } catch (error) {
    console.error('Save progress error:', error);
    throw createError({ message: "Failed to save progress", statusCode: 500 })
  }
})
