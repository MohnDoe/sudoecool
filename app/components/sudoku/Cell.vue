<script setup lang="ts">
const { cell, index } = defineProps<{
  cell: Cell
  index: number
}>()
const gameStore = useGameStore();
const { cellConflicts, selectedIndex, selectedCell } = storeToRefs(gameStore)


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

const cellClasses = reactive({
  "sudoku-cell--filled": cell.value !== null,
  "sudoku-cell--empty": cell.value === null,
  "sudoku-cell--given": cell.given,
  "sudoku-cell--related": isRelated,
  "sudoku-cell--selected": isSelected,
  "sudoku-cell--same": isSameNumber,
  "sudoku-cell--error": hasError
})
</script>

<template>
  <div class="sudoku-cell text-2xl aspect-square" :class="cellClasses" role="button" @click="$emit('cellClicked')">
    <span v-if="cell.value !== null" :class="[cell.given ? 'font-bold' : 'font-normal']">
      {{ cell.value }}
    </span>
    <SudokuCellNotes v-else-if="cell.notes.length" :notes="cell.notes"
      :highlight="selectedCell ? selectedCell.value : null" />
  </div>
</template>

<style scoped>
.sudoku-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--cell-border-thickness) solid var(--cell-border-color);
  cursor: pointer;
  position: relative;
  background-color: var(--cell-background-color);
  box-sizing: border-box;
}

/* Thicker right border for 3x3 regions */
.sudoku-cell:nth-child(3n):not(:nth-child(9n)) {
  border-right: var(--region-border-thickness) solid var(--region-border-color);
}

/* Thicker bottom border for 3x3 regions */
.sudoku-cell:nth-child(n + 19):nth-child(-n + 27),
.sudoku-cell:nth-child(n + 46):nth-child(-n + 54) {
  border-bottom: var(--region-border-thickness) solid var(--region-border-color);
}

/* Cell States */
.sudoku-cell--given {
  background-color: var(--cell-given-background);
  font-weight: 700;
  cursor: default;
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

.sudoku-cell--selected {
  background-color: var(--cell-selected-background);
}

.sudoku-cell--filled:not(.sudoku-cell--given) {
  color: var(--cell-filled-foreground);
  font-weight: 800;
}

.sudoku-cell--error::after {
  position: absolute;
  content: ' ';
  height: 4px;
  border-radius: 4px;
  bottom: 8px;
  left: 8px;
  right: 8px;
  /* background-color: var(--color-destructive); */
  background-color: red;
}
</style>
