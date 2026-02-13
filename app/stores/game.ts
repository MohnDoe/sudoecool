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
    }
  },
  getters: {
    selectedCell: (state): Cell | null => {
      if (state.selectedIndex == null) return null;
      return state.grid.find((_, index) => index == state.selectedIndex) ?? null
    },
    remainingCount: (state) => {
      return (num: number) =>
        state.grid.reduce(
          (prev, cell) => {
            let remaining = prev;
            if (cell.value === num) {
              remaining--;
            }

            return Math.max(0, remaining);
          }, GRID_SIZE)

    },
    cellConflicts: (state: GameState) => {
      // TODO : fix conflicts for "given" cells
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
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        this.clearColOfNote(col, value, index)
        this.clearRowOfNote(row, value, index);
        this.clearRegionOfNote({ col, row }, value, index)
      }

      // TODO: update conflicts
    },
    clearCell(index: number) {
      this.setCellValue(index, null)
    },
    clearRegionOfNote({ col, row }: { col: number, row: number }, num: number, index: number) {
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      console.log(`Clearing all ${num} in region ${boxCol}x${boxRow}`);
      const newGrid = [...this.grid];
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          const i = r * GRID_SIZE + c;
          if (i === index) continue;
          const targetCell = newGrid[i];
          if (!targetCell) continue;

          if (targetCell.notes.includes(num)) {
            targetCell.notes = removeNote(targetCell.notes, num);
          }
        }
      }
      this.grid = newGrid;
    },
    clearRowOfNote(row: number, num: number, index: number) {
      console.log(`Clearing all ${num} on row ${row}`)
      const newGrid = [...this.grid];

      for (let c = 0; c < GRID_SIZE; c++) {
        const i = row * GRID_SIZE + c;
        if (i === index) continue;
        const targetCell = newGrid[i];
        if (!targetCell) continue;
        if (targetCell.notes.includes(num)) {
          targetCell.notes = removeNote(targetCell.notes, num);
        }
      }

      this.grid = newGrid;
    },
    clearColOfNote(col: number, num: number, index: number) {
      console.log(`Clearing all ${num} of col ${col}`);
      const newGrid = [...this.grid];

      for (let r = 0; r < GRID_SIZE; r++) {
        const i = r * GRID_SIZE + col;
        if (i === index) continue;
        const targetCell = newGrid[i];

        if (!targetCell) continue;
        if (targetCell.notes.includes(num)) {
          targetCell.notes = removeNote(targetCell.notes, num);
        }
      }

      this.grid = newGrid;
    }
  }
});
