import { useCallback } from "react";
import GameBoard from "./GameBoard"
import GameBoardButtons from "./GameBoardButtons"
import GameInfos from "./GameInfos"
import { useGameStore } from "@/stores/gameStore";

export default function Sudoku() {
  const { grid, selectedIndex, clearCell, notesMode, toggleNote, toggleNotesMode, setCellValue } = useGameStore()

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

  const onRemoveButtonPress = useCallback(
    () => {
      if (selectedIndex !== null) {
        clearCell(selectedIndex);
      }
    }, [selectedIndex, clearCell]
  )

  return <div className="flex flex-col justify-between p-1 h-full">
    <div className="flex flex-col gap-4">
      <GameInfos />
      <GameBoard handleNumInsertion={handleNumInsertion} />
    </div>
    <div className="p-4">
      <GameBoardButtons
        onNumPadButtonPress={handleNumInsertion}
        onNotesButtonPress={toggleNotesMode}
        onRemoveButtonPress={onRemoveButtonPress}
      />
    </div>
  </div>
}
