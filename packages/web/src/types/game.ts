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
  loading: boolean,
  isSaving: boolean,
  isCompleted: boolean
}

export interface GameActions {
  resetGame: () => void,
  loadPuzzle: (data: { puzzle: string, currentState?: Cell[], puzzleId?: string, puzzleDate?: string }) => void,
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
}


