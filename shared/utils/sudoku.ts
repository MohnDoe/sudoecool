import type { Cell } from "../types/sudoku";

export const TOTAL_CELLS = 81;
export const GRID_SIZE = 9;
export const BOX_SIZE = 9;

export function parsePuzzle(puzzle: string): Cell[] {
  return puzzle.split('').map((char) => {
    const value = char === '-' ? null : parseInt(char);

    return {
      conflicts: [],
      notes: [],
      state: value == null ? 'empty' : 'filled',
      value,
      given: value != null,
      error: false
    } as Cell
  })
}
