import type { Difficulty } from "sudoku-gen/dist/types/difficulty.type";

export type SudokuDifficulty = Difficulty;

export type CellValue = number | null;
export type CellState = 'empty' | 'filled' | 'error';

export interface Cell {
  value: CellValue
  notes: number[]
  conflicts: number[]
  given: boolean
  error: boolean
}
