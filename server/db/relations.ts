import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  dailyPuzzles: {
    usersViaGameProgress: r.many.users({
      from: r.dailyPuzzles.id.through(r.gameProgress.puzzleId),
      to: r.users.id.through(r.gameProgress.userId),
      alias: "dailyPuzzles_id_users_id_via_gameProgress"
    }),
  },
  users: {
    dailyPuzzlesViaGameProgress: r.many.dailyPuzzles({
      alias: "dailyPuzzles_id_users_id_via_gameProgress"
    }),
    dailyPuzzlesViaGameResults: r.many.dailyPuzzles({
      alias: "dailyPuzzles_id_users_id_via_gameResults"
    }),
  },
}))
