<script setup lang="ts">
const { cell, index } = defineProps<{
  cell: Cell
  index: number
}>()
const gameStore = useGameStore();
const { cellConflicts, selectedIndex, selectedCell, isPaused, isCompleted } = storeToRefs(gameStore)


const isSelected = computed(() => selectedIndex.value == index)
const hasError = computed(() => cell.error || cellConflicts.value((index)).length > 0)

const isRelated = computed(() => {
  if (selectedIndex.value === null) return false;

  const row = Math.floor(index / 9);
  const col = index % 9;
  const sRow = Math.floor(selectedIndex.value / 9);
  const sCol = selectedIndex.value % 9;

  // Same row, column, or 3x3 box
  return (
    row === sRow ||
    col === sCol ||
    (Math.floor(row / 3) === Math.floor(sRow / 3) &&
      Math.floor(col / 3) === Math.floor(sCol / 3))
  );
})

const isSameNumber = computed(() => {
  return selectedCell.value?.value !== null &&
    cell.value !== null &&
    cell.value === selectedCell.value?.value
})

const cellClasses = computed(() => ({
  "sudoku-cell--filled": cell.value !== null,
  "sudoku-cell--empty": cell.value === null && !cell.given,
  "sudoku-cell--given": cell.given,
  "sudoku-cell--related": isRelated.value,
  "sudoku-cell--selected": isSelected.value,
  "sudoku-cell--same": isSameNumber.value,
  "sudoku-cell--error": hasError.value,
  "sudoku-cell--hidden": isPaused.value && !isCompleted.value
}))
</script>

<template>
  <div class="
    sudoku-cell
    text-xl
    aspect-square" :class="cellClasses" role="button" @click="$emit('cellClicked')">
    <span v-if="cell.value !== null" :class="[cell.given ? 'font-bold' : 'font-normal']">
      {{ cell.value }}
    </span>
    <SudokuCellNotes v-else-if="cell.notes.length" :notes="cell.notes"
      :highlight="selectedCell ? selectedCell.value : null" />
  </div>
</template>

<style scoped>
.sudoku-cell {
  border-radius: var(--cell-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  background-color: var(--cell-background-color);
  box-sizing: border-box;
  font-family: "Switzer", sans-serif;
  font-variant-numeric: tabular-nums;
}

/* Cell States */
.sudoku-cell--given {
  background-color: var(--cell-given-background);
  font-weight: 700;
}

.sudoku-cell--related::before,
.sudoku-cell--error::before {
  z-index: 0;
  content: " ";
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: var(--cell-highlight-background);
}

.sudoku-cell--same {
  background-color: var(--cell-same-background);
}

.sudoku-cell--error {
  color: var(--cell-error-foreground)
}

.sudoku-cell--error::after {
  position: absolute;
  content: ' ';
  border: 4px solid var(--ui-error);
  border-radius: 8px;
  bottom: 4px;
  right: 4px;
  left: 4px;
  top: 4px;
}

.sudoku-cell--selected {
  background-color: var(--cell-selected-background);
}

.sudoku-cell--selected.sudoku-cell--error {
  background-color: var(--ui-error);
  color: white;
}

.sudoku-cell--error.sudoku-cell--selected::after {
  border-color: white;
  left: unset;
  top: unset;
  right: 4px;
  bottom: 4px;
  border-width: 4px;
}

.sudoku-cell--filled:not(.sudoku-cell--given) {
  color: var(--cell-filled-foreground);
  font-weight: 800;
}

.sudoku-cell--hidden {
  color: transparent !important
}
</style>
