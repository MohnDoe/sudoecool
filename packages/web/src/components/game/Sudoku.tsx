import { useCallback } from "react";
import GameBoard from "./GameBoard"
import GameBoardButtons from "./GameBoardButtons"
import GameInfos from "./GameInfos"
import { useGameStore } from "@/stores/gameStore";

export default function Sudoku() {
  const { grid, selectedIndex, notesMode, toggleNote, setCellValue } = useGameStore()

  const handleNumInsertion = useCallback(
    (num: number) => {
      const cell = grid[selectedIndex!];
      if (!cell) return;
      if (cell.given) return;

      if (notesMode) {
        toggleNote(selectedIndex!, num);
      } else {
        setCellValue(selectedIndex!, num);
      }
    }, [selectedIndex, toggleNote, setCellValue, grid, notesMode]
  )
  return <div className="flex flex-col justify-between p-1 h-full">
    <div className="flex flex-col gap-4">
      <GameInfos />
      <GameBoard handleNumInsertion={handleNumInsertion} />
    </div>
    <div className="p-4">
      <GameBoardButtons handleNumInsertion={handleNumInsertion} />
    </div>
  </div>
}
