import { useGameStore } from "@/stores/gameStore";
import { KeyboardEvent, useCallback, useEffect } from "react";
import Cell from "./Cell";

import { useAutoSave } from "@/hooks/useAutoSave";
import "@/styles/sudoku.css";

export default function GameBoard({
  handleNumInsertion
}: {
  handleNumInsertion: (num: number) => void
}) {
  const {
    grid,
    selectedIndex,
    clearCell,
    toggleNotesMode,
    unselectCell,
    selectCell,
  } = useGameStore();

  useAutoSave();

  const handleRelativeMove = useCallback(
    (arrow: string) => {
      if (selectedIndex == null) return;
      const row = Math.floor(selectedIndex / 9);
      const col = selectedIndex % 9;

      let newRow = row;
      let newCol = col;

      switch (arrow) {
        case "ArrowUp":
          newRow = (row + 9 - 1) % 9;
          break;
        case "ArrowDown":
          newRow = (row + 1) % 9;
          break;
        case "ArrowLeft":
          newCol = (col + 9 - 1) % 9;
          break;
        case "ArrowRight":
          newCol = (col + 1) % 9;
          break;
      }

      selectCell(newRow * 9 + newCol);
    },
    [selectedIndex, selectCell],
  );



  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(`key press on ${selectedIndex} : ${e.key}`);
      if (e.key === "e") {
        e.preventDefault();
        toggleNotesMode();
        return;
      }
      if (selectedIndex == null) return;

      if (e.key === "Escape") {
        unselectCell();
        return;
      }

      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        handleRelativeMove(e.key);
      }

      if (/[1-9]/.test(e.key)) {
        e.preventDefault();
        const num = parseInt(e.key);
        handleNumInsertion(num);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        clearCell(selectedIndex);
      }
    },
    [
      selectedIndex,
      clearCell,
      toggleNotesMode,
      unselectCell,
      handleRelativeMove,
      handleNumInsertion
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", () => handleKeyDown);
    return () => window.removeEventListener("keydown", () => handleKeyDown);
  }, [handleKeyDown]);

  const selectedCell = selectedIndex !== null ? grid[selectedIndex] : null;
  const selectedCellValue = selectedCell?.value ?? null;

  return (
    <div className="sudoku-board w-full p-1">
      <div
        className="
        sudoku-grid
        w-full aspect-square
        grid grid-cols-9 grid-rows-9
        gap-0
        "
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {grid.map((cell, index) => {
          const isSelected = selectedIndex === index;
          const isRelated = isCellRelated(index, selectedIndex);
          const isSameNumber =
            selectedCellValue !== null &&
            cell.value !== null &&
            cell.value === selectedCellValue;

          return <Cell
            key={`cell-${index}`}
            index={index}
            cell={cell}
            isSelected={isSelected}
            isRelated={isRelated}
            isSameNumber={isSameNumber}
            selectedCellValue={selectedCellValue}
            selectCell={selectCell}
          />
        })}
      </div>
    </div>
  );
}
// Helper function to determine if two cells are related (same row, column, or 3x3 box)
const isCellRelated = (
  cellIndex: number,
  selectedIndex: number | null,
): boolean => {
  if (selectedIndex === null) return false;

  const row = Math.floor(cellIndex / 9);
  const col = cellIndex % 9;
  const sRow = Math.floor(selectedIndex / 9);
  const sCol = selectedIndex % 9;

  // Same row, column, or 3x3 box
  return (
    row === sRow ||
    col === sCol ||
    (Math.floor(row / 3) === Math.floor(sRow / 3) &&
      Math.floor(col / 3) === Math.floor(sCol / 3))
  );
};
