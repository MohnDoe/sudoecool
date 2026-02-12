<script setup lang="ts">
import "~/assets/css/sudoku.css";

const {
  handleNumInsertion
} = defineProps<{
  handleNumInsertion: (num: number) => void
}>()

const gameStore = useGameStore();
const { grid, selectedIndex } = storeToRefs(gameStore);

const selectedCell = selectedIndex.value !== null ? grid.value[selectedIndex.value] : null;
const selectedCellValue = selectedCell?.value ?? null;

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

const isCellSameNumber = (cell: Cell) => {
  return selectedCellValue !== null &&
    cell.value !== null &&
    cell.value === selectedCellValue
}
</script>
<template>
  <div className="sudoku-board w-full p-1">
    <div className="
        sudoku-grid
        w-full aspect-square
        grid grid-cols-9 grid-rows-9
        gap-0
        " tabIndex="0">
      <SudokuCell v-for="(cell, index) in grid" :index="index" :cell="cell" :key="index"
        :isSelected="selectedIndex == index" :isRelated="isCellRelated(index, selectedIndex)"
        :isSameNumber="isCellSameNumber(cell)" :selectedCellValue="selectedCellValue"
        @click="gameStore.selectCell(index)" />
    </div>
  </div>
</template>

<style scoped>
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: 100%;
  aspect-ratio: 1 / 1;
  border-collapse: collapse;
  border: var(--region-border-thickness) solid var(--region-border-color);
}
</style>
