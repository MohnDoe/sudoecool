import { gameProgress } from "#server/db/schema";
import type { Cell } from "#shared/types/sudoku";

type gameProgressSelect = typeof gameProgress.$inferSelect;
export interface GameProgress extends gameProgressSelect {
  currentState: Cell[]
}
