import { type Cell } from "@sudoecool/shared";
import React from "react";
import CellNotesGrid from "./CellNotesGrid";

export default React.memo(function Cell({
  cell,
  index,
  isSelected,
  isRelated,
  isSameNumber,
  selectedCellValue,
  selectCell,
}: {
  cell: Cell
  index: number;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  selectedCellValue: number | null;
  selectCell: (index: number) => void;
}) {
  const hasError = cell.error;

  const cellClasses = [
    "sudoku-cell text-2xl",
    cell.value !== null ? "sudoku-cell--filled" : "sudoku-cell--empty",
    cell.given && "sudoku-cell--given",
    isSelected && "sudoku-cell--selected",
    isRelated && "sudoku-cell--related",
    isSameNumber && "sudoku-cell--same",
    hasError && "sudoku-cell--error",
  ].join(" ");

  const handleClick = () => {
    selectCell(index);
  };

  return (
    <div className={cellClasses + " aspect-square"} role="button" onClick={handleClick}>
      {cell.value !== null ? (
        <span className={cell.given ? "font-bold" : "font-normal"}>
          {cell.value}
        </span>
      ) : (
        <CellNotesGrid
          notes={cell.notes}
          highlight={selectedCellValue}
        />
      )}
    </div>
  );
})
