import { getSudoku } from "sudoku-gen";
import { Difficulty } from "sudoku-gen/dist/types/difficulty.type";

export function generateRandomSudoku(difficulty: Difficulty) {
  return getSudoku(difficulty);
}

export type SudokuDifficulty = Difficulty;

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

export type CellValue = number | null;
export type CellState = 'empty' | 'filled' | 'error';

export interface Cell {
  value: CellValue
  notes: number[]
  conflicts: number[]
  given: boolean
  error: boolean
}
