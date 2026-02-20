import { GRID_SIZE, parsePuzzle, TOTAL_CELLS } from "#shared/utils/sudoku";

import type { GameProgress } from "#shared/types/game";
import type { Cell, SudokuDifficulty } from '#shared/types/sudoku';
import { parse } from "@electric-sql/pglite";

interface GameState {
  puzzle: string | null,
  puzzleId: string | null,
  puzzleDate: string | null,
  difficulty: SudokuDifficulty,

  grid: Cell[],
  selectedIndex: number | null
  notesMode: boolean,

  moves: number,
  timeSpent: number,
  hints: number,
  mistakes: number,

  status: "ongoing" | "completed" | "failed",

  isLoading: boolean,
  isSaving: boolean,
  isCompleted: boolean,
  isPaused: boolean,
  isVerifying: boolean,
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

const emptyGrid = Array(TOTAL_CELLS).fill(null).map(() => ({
  conflicts: [],
  notes: [],
  state: 'empty',
  value: null,
  given: false,
  error: false
}))

export const useGameStore = defineStore('gameStore', {
  state: (): GameState => {
    return {
      grid: emptyGrid,
      difficulty: "easy",
      hints: 0,
      moves: 0,
      mistakes: 0,
      puzzle: null,
      puzzleDate: null,
      puzzleId: null,
      timeSpent: 0,
      status: "ongoing",
      notesMode: false,
      selectedIndex: null,
      isSaving: false,
      isCompleted: false,
      isLoading: true,
      isPaused: false,
      isVerifying: false,
    }
  },
  getters: {
    currentTimeSpentMs: (): number => {
      const gameTimerStore = useGameTimerStore();
      return gameTimerStore.elapsedTime
    },
    formattedTimeSpent: (): string => {
      const gameTimerStore = useGameTimerStore();
      return gameTimerStore.formattedTime
    },
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
    isFilled: (state): boolean => {
      return state.grid.every((cell) => cell.value != null);
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
    async initDaily() {
      console.log("gameStore.initDaily");
      this.isLoading = true;
      const { data } = await useFetch('/api/games/daily');

      if (data.value) {
        this.loadGame({
          puzzle: data.value.daily.puzzle,
          puzzleId: data.value.daily.id,
          progress: data.value.progress as GameProgress
        })
      }

      this.isLoading = false
    },
    async verifyBoard() {
      if (this.isVerifying) return;
      this.isVerifying = true;
      try {
        const result = await $fetch('/api/games/verify', {
          method: "POST",
          body: {
            board: this.grid.map((cell) => cell.value).join(''),
            puzzleId: this.puzzleId
          }
        })
      } finally {
        this.isVerifying = false
      }
    },
    resetGrid() {
      if (this.puzzle) {
        this.grid = emptyGrid;
        this.grid = parsePuzzle(this.puzzle);
        this.selectedIndex = null;
      }
    },
    loadGame({ puzzle, puzzleId, progress }: { puzzle: string, puzzleId: string, progress?: GameProgress }) {
      this.puzzle = puzzle;
      this.puzzleId = puzzleId
      this.grid = parsePuzzle(this.puzzle);

      this.hints = 0
      this.moves = 0
      this.mistakes = 0;

      this.status = 'ongoing'
      this.isCompleted = false
      this.isPaused = false
      this.selectedIndex = null
      if (progress) {
        this.loadProgress(progress)
      } else {
        const gameTimerStore = useGameTimerStore();
        gameTimerStore.reset();
        gameTimerStore.start();
      }
    },
    loadProgress(savedState: GameProgress) {
      this.grid = savedState.currentState
      this.mistakes = savedState.mistakes;
      this.hints = savedState.hints;
      this.moves = savedState.moves;


      // Load the saved time into timer and start it
      const timerStore = useGameTimerStore()
      timerStore.elapsedTime = (savedState.timeSpent || 0) * 1000
      timerStore.start()
    },

    pauseGame() {
      this.isPaused = true
      // Pause timer and sync time
      const timerStore = useGameTimerStore()
      timerStore.pause()
      this.timeSpent = Math.floor(timerStore.elapsedTime / 1000)
    },
    // Resume the game
    unpauseGame() {
      this.isPaused = false

      // Resume timer
      const timerStore = useGameTimerStore()
      timerStore.start()
    },
    // Sync timeSpent from timer (call periodically or before saving)
    syncTimeFromTimer() {
      const timerStore = useGameTimerStore()
      this.timeSpent = Math.floor(timerStore.elapsedTime / 1000)
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

      const oldValue = this.grid[index]!.value
      const newCell: Cell = {
        ...this.grid[index]!,
        notes: [],
        value,
        conflicts: [],
        error: false
      }

      this.grid[index] = newCell;

      if (value !== null && value !== oldValue) {

        const conflicts = this.cellConflicts(index);

        if (conflicts.length > 0) {
          this.mistakes++
        }

        if (this.isFilled) {
          this.verifyBoard()
          return;
        }

        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        this.clearColOfNote(col, value, index)
        this.clearRowOfNote(row, value, index);
        this.clearRegionOfNote({ col, row }, value, index)
      }
    },
    clearCell(index: number) {
      this.setCellValue(index, null)
    },
    clearRegionOfNote({ col, row }: { col: number, row: number }, num: number, index: number) {
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      console.log(`Clearing all ${num} in region ${boxCol}x${boxRow}`);
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          const i = r * GRID_SIZE + c;
          if (i === index) continue;
          const targetCell = this.grid[i];
          if (!targetCell) continue;

          if (targetCell.notes.includes(num)) {
            targetCell.notes = removeNote(targetCell.notes, num);
          }
        }
      }
    },
    clearRowOfNote(row: number, num: number, index: number) {
      console.log(`Clearing all ${num} on row ${row}`)

      for (let c = 0; c < GRID_SIZE; c++) {
        const i = row * GRID_SIZE + c;
        if (i === index) continue;
        const targetCell = this.grid[i];
        if (!targetCell) continue;
        if (targetCell.notes.includes(num)) {
          targetCell.notes = removeNote(targetCell.notes, num);
        }
      }
    },
    clearColOfNote(col: number, num: number, index: number) {
      console.log(`Clearing all ${num} of col ${col}`);

      for (let r = 0; r < GRID_SIZE; r++) {
        const i = r * GRID_SIZE + col;
        if (i === index) continue;
        const targetCell = this.grid[i];

        if (!targetCell) continue;
        if (targetCell.notes.includes(num)) {
          targetCell.notes = removeNote(targetCell.notes, num);
        }
      }
    }
  }
});
