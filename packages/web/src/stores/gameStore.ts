import { GameActions, GameState } from "@/types/game";
import { Cell, GRID_SIZE, parsePuzzle, TOTAL_CELLS } from "@sudoecool/shared";
import { create, StateCreator } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";


type Store = GameState & GameActions

function removeNote(notes: number[], note: number) {
  return notes.filter(n => n !== note);
}

function addNote(notes: number[], noteToAdd: number): number[] {
  if (notes.includes(noteToAdd)) {
    return notes; // Already included, return original
  }
  return [...notes, noteToAdd];
}

function mergeGrid(original: Cell[], data: Cell[]) {
  const newGrid = data.map((cell, index) => {
    if (original[index].given) {
      return original[index];
    } else {
      return cell
    }
  })

  return newGrid;
}

const createGameStore: StateCreator<Store> = (set, get) => ({
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

  //actions

  setIsSaving: (saving: boolean) => {
    set({
      isSaving: saving
    })
  },
  setTimeSpent: (seconds: number) => {
    set({
      timeSpent: seconds
    })
  },
  pauseGame: () => {
    set({
      isPaused: true
    })
  },
  resumeGame: () => {
    set({
      isPaused: false
    })
  },
  resetGame: () => {

  },
  loadPuzzle: (data) => {
    let grid = parsePuzzle(data.puzzle);
    let newState = {
      ...get(),
      ...{
        puzzle: data.puzzle,
        puzzleId: data.puzzleId,
        puzzleDate: data.puzzleDate,
      }
    }


    if (data.progress !== null) {
      if (data.progress!.currentState.length === TOTAL_CELLS) {
        grid = mergeGrid(grid, data.progress!.currentState);
      }
      newState = {
        ...newState,
        isCompleted: data.progress!.isCompleted,
        timeSpent: data.progress!.timeSpent,
        hints: data.progress!.hints,
        moves: data.progress!.moves
      }
    }

    newState = {
      ...newState,
      grid,
      remainingCounts: updateRemainingCounts(grid),
    }

    set(newState)
  },
  selectCell: (index: number) => {
    set({ selectedIndex: Math.min(TOTAL_CELLS - 1, Math.max(0, index)) })
  },
  unselectCell: () => {
    set({ selectedIndex: null })
  },
  setCellValue: (index: number, value: number | null) => {
    const state = get();
    if (index < 0 || index >= TOTAL_CELLS) return;
    if (state.grid[index].given) return;

    let newGrid = [...state.grid];
    const newCell = { ...newGrid[index] };


    newCell.notes = [];
    newCell.value = value;
    newCell.conflicts = []
    newCell.error = false;

    newGrid[index] = newCell;

    if (value !== null) {
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      state.clearRegionOfNote({ col, row }, value, index);
      state.clearRowOfNote(row, value, index);
      state.clearColOfNote(col, value, index);
    }


    newGrid = updateConflics(newGrid);

    // TODO : add to history

    set({
      grid: newGrid,
      remainingCounts: updateRemainingCounts(newGrid)
    })

  },
  clearCell: (index: number) => {
    get().setCellValue(index, null)
  },
  clearRowOfNote: (row: number, num: number, index: number) => {
    console.log(`Clearing all ${num} on row ${row}`)
    const state = get();
    const newGrid = [...state.grid];

    for (let c = 0; c < GRID_SIZE; c++) {
      const i = row * GRID_SIZE + c;
      const targetCell = newGrid[i];
      if (i === index) continue;

      if (targetCell.notes.includes(num)) {
        targetCell.notes = removeNote(targetCell.notes, num);
      }
    }

    set({
      grid: newGrid
    })
  },
  clearColOfNote: (col: number, num: number, index: number) => {
    console.log(`Clearing all ${num} of col ${col}`);
    const newGrid = [...get().grid];

    for (let r = 0; r < GRID_SIZE; r++) {
      const i = r * GRID_SIZE + col;
      const targetCell = newGrid[i];
      if (i === index) continue;

      if (targetCell.notes.includes(num)) {
        targetCell.notes = removeNote(targetCell.notes, num);
      }
    }

    set({
      grid: newGrid
    })
  },
  clearRegionOfNote: ({ col, row }: { col: number, row: number }, num: number, index: number) => {
    const boxRow = Math.floor(row / 3);
    const boxCol = Math.floor(col / 3);
    console.log(`Clearing all ${num} in region ${boxCol}x${boxRow}`);
    const newGrid = [...get().grid];
    for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
      for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
        const i = r * GRID_SIZE + c;
        const targetCell = newGrid[i];
        if (i === index) continue;

        if (targetCell.notes.includes(num)) {
          targetCell.notes = removeNote(targetCell.notes, num);
        }
      }
    }
    set({
      grid: newGrid
    })
  },
  toggleNotesMode: () => set(state => ({ notesMode: !state.notesMode })),
  toggleNote: (index: number, note: number) => {
    const state = get();

    if (index < 0 || index >= TOTAL_CELLS) return;
    if (state.grid[index].given) return;
    if (state.grid[index].value !== null) return;

    const newGrid = [...state.grid];
    const currentCell = newGrid[index];

    let newCell;

    if (currentCell.notes.includes(note)) {
      newCell = {
        ...currentCell,
        notes: removeNote(currentCell.notes, note)
      }
    } else {
      newCell = {
        ...currentCell,
        notes: addNote(currentCell.notes, note)
      }
    }

    console.log(newCell)

    newGrid[index] = newCell;


    set({ grid: newGrid })
  }
})
const updateConflics = (grid: Cell[]): Cell[] => {
  const result: Cell[] = grid.map(cell => ({
    ...cell,
    error: false,
    conflicts: []
  }));

  for (let i = 0; i < result.length; i++) {
    const cell = result[i];

    if (cell.value === null || cell.given) continue;

    const conflicts = findConflicts(grid, i);

    result[i] = {
      ...cell,
      error: cell.error || conflicts.length > 0,
      conflicts
    };

    for (const conflictingIdx of conflicts) {
      const conflictingCell = result[conflictingIdx];

      result[conflictingIdx] = {
        ...conflictingCell,
        error: true,
        conflicts: [...conflictingCell.conflicts, i]
      }
    }

  }

  return result;
}

const updateRemainingCounts = (grid: Cell[]) => {
  const remainingCounts = Array(GRID_SIZE).fill(GRID_SIZE)
    .map((_, i) => {
      return grid.reduce((prev, cell) => {
        const num = i + 1;
        let remaining = prev;
        if (cell.value === num) {
          remaining--;
        }

        return Math.max(0, remaining);
      }, GRID_SIZE);

    })

  return remainingCounts;
}

const findConflicts = (grid: Cell[], index: number) => {
  console.log(`Looking for conflict in cell #${index}`)
  const value = grid[index].value;
  const conflicts: number[] = [];

  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  // ROW
  for (let c = 0; c < GRID_SIZE; c++) {
    const i = row * GRID_SIZE + c;
    if (i !== index && grid[i].value == value) {
      conflicts.push(i);
    }
  }

  // COL
  for (let r = 0; r < GRID_SIZE; r++) {
    const i = r * GRID_SIZE + col;
    if (i !== index && grid[i].value == value) {
      conflicts.push(i);
    }
  }

  // Box
  const boxRow = Math.floor(row / 3)
  const boxCol = Math.floor(col / 3)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const i = (boxRow * 3 + r) * GRID_SIZE + (boxCol * 3 + c)
      if (i !== index && grid[i].value === value) {
        conflicts.push(i)
      }
    }
  }

  return conflicts;
}

export const useGameStore = create(
  subscribeWithSelector(
    devtools(createGameStore, { name: 'SudokuGameStore' })
  )
)
