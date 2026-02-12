import type { SudokuDifficulty, Cell } from '#shared/types/sudoku';
import { GRID_SIZE, TOTAL_CELLS } from "#shared/utils/sudoku"

interface GameState {
  puzzle: string | null,
  puzzleId: string | null,
  puzzleDate: string | null,
  difficulty: SudokuDifficulty,

  grid: Cell[],
  selectedIndex: number | null
  notesMode: boolean,
  remainingCounts: number[],

  moves: number,
  hints: number,
  timeSpent: number,

  status: "ongoing" | "completed" | "failed",

  isLoading: boolean,
  isSaving: boolean,
  isCompleted: boolean,
  isPaused: boolean
}


export const useGameStore = defineStore('gameStore', () => {
  state: (): GameState => {
    return {
      grid: Array(TOTAL_CELLS).fill(null).map(() => ({
        conflicts: [],
        notes: [],
        state: 'empty',
        value: null,
        given: false,
        error: false
      })),
      difficulty: "easy",
      hints: 0,
      moves: 0,
      puzzle: null,
      puzzleDate: null,
      puzzleId: null,
      status: "ongoing",
      timeSpent: 0,
      notesMode: false,
      selectedIndex: null,
      isSaving: false,
      isCompleted: false,
      isLoading: true,
      isPaused: false,
      remainingCounts: Array(GRID_SIZE).fill(GRID_SIZE),
    }
  }
});
