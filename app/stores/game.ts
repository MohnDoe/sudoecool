import type { SudokuDifficulty, Cell } from '#shared/types/sudoku';
import { GRID_SIZE, parsePuzzle, TOTAL_CELLS } from "#shared/utils/sudoku"

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

function removeNote(notes: number[], note: number) {
  return notes.filter(n => n !== note);
}

function addNote(notes: number[], noteToAdd: number): number[] {
  if (notes.includes(noteToAdd)) {
    return notes; // Already included, return original
  }
  return [...notes, noteToAdd];
}

export const useGameStore = defineStore('gameStore', {
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
  },
  getters: {
    cellConflicts: (state: GameState) => {
      return (index: number) => {
        const cell = state.grid[index];
        if (!cell) return [];

        const value = cell.value;
        if (value === null || cell.given) return [];

        const conflicts: number[] = [];

        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;

        // ROW
        for (let c = 0; c < GRID_SIZE; c++) {
          const i = row * GRID_SIZE + c;
          if (i !== index && state.grid[i]!.value == value) {
            conflicts.push(i);
          }
        }

        // COL
        for (let r = 0; r < GRID_SIZE; r++) {
          const i = r * GRID_SIZE + col;
          if (i !== index && state.grid[i]!.value == value) {
            conflicts.push(i);
          }
        }

        // Box
        const boxRow = Math.floor(row / 3)
        const boxCol = Math.floor(col / 3)
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const i = (boxRow * 3 + r) * GRID_SIZE + (boxCol * 3 + c)
            if (i !== index && state.grid[i]!.value === value) {
              conflicts.push(i)
            }
          }
        }

        console.debug(`conflicts on ${index}`, conflicts)

        return conflicts;
      }
    }
  },
  actions: {
    loadPuzzle({ puzzle }: { puzzle: string }) {
      let grid = parsePuzzle(puzzle);

      this.grid = grid;
    },
    selectCell(index: number) {
      this.selectedIndex = Math.min(TOTAL_CELLS - 1, Math.max(0, index))
    },
    unselectCell() {
      this.selectedIndex = null;
    },
    toggleNotesMode() {
      this.notesMode = !this.notesMode
    },
    toggleNode(index: number, note: number) {
      if (index < 0 || index >= TOTAL_CELLS) return;
      if (this.grid[index]!.given) return;
      // if (this.grid[index]!.value !== null) return;
      let notes = this.grid[index]!.notes;

      if (notes.includes(note)) {
        notes = removeNote(notes, note)
      } else {
        notes = addNote(notes, note)
      }

      this.grid[index]!.notes = notes;
    },
    insertNumber(num: number) {
      if (this.selectedIndex === null) return;
      const cell = this.grid[this.selectedIndex];
      if (!cell) return;
      if (cell.given) return;

      if (this.notesMode) {
        this.toggleNode(this.selectedIndex, num);
      } else {
        this.setCellValue(this.selectedIndex, num);
      }
    },
    setCellValue(index: number, value: number | null) {
      if (index < 0 || index >= TOTAL_CELLS) return;
      if (this.grid[index]!.given) return;


      const newCell: Cell = {
        ...this.grid[index]!,
        notes: [],
        value,
        conflicts: [],
        error: false
      }


      this.grid[index] = newCell;

      if (value !== null) {
        //TODO: clear notes on rows and such
      }

      // TODO: update conflicts
    },
    clearCell(index: number) {
      this.setCellValue(index, null)
    }
  }
});
