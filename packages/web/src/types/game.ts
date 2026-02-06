import { Cell, SudokuDifficulty } from "@sudoecool/shared";


export interface GameState {
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

export interface GameActions {
  resetGame: () => void,
  loadPuzzle: (data: {
    puzzle: string, puzzleId?: string, puzzleDate?: string, progress?: {
      currentState: Cell[],
      moves: number,
      hints: number,
      timeSpent: number,
      isCompleted: boolean,
      lastSavedAt: string,
    } | null
  }) => void,
  selectCell: (index: number) => void,
  unselectCell: () => void,
  setCellValue: (index: number, num: number | null) => void,
  clearCell: (index: number) => void,
  toggleNotesMode: () => void,
  toggleNote: (index: number, note: number) => void,
  clearRowOfNote: (row: number, num: number, index: number) => void,
  clearColOfNote: (col: number, num: number, index: number) => void,
  clearRegionOfNote: ({ col, row }: { col: number, row: number }, num: number, index: number) => void,
  setIsSaving: (saving: boolean) => void,
  setTimeSpent: (seconds: number) => void,
  pauseGame: () => void,
  resumeGame: () => void
}


