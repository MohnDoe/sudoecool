<script setup lang="ts">
const { grid } = useGameStore();
const { cellConflicts } = storeToRefs(useGameStore())
const {
  cell, isSelected, isSameNumber, isRelated, index
} = defineProps<{
  cell: Cell
  index: number
  isSelected: boolean
  isRelated: boolean
  isSameNumber: boolean
  selectedCellValue: number | null
}>()

const hasError = ref(false);

watch(grid, () => {
  // TODO: is this good ?
  hasError.value = cell.error || cellConflicts.value(index).length > 0
})

const cellClasses = computed(() => ({
  "sudoku-cell--filled": cell.value !== null,
  "sudoku-cell--empty": cell.value === null,
  "sudoku-cell--given": cell.given,
  "sudoku-cell--related": isRelated,
  "sudoku-cell--selected": isSelected,
  "sudoku-cell--same": isSameNumber,
  "sudoku-cell--error": hasError.value
}))
</script>

<template>
  <div class="sudoku-cell text-2xl aspect-square" :class="cellClasses" role="button" @click="$emit('cellClicked')">
    <span v-if="cell.value !== null" :class="[cell.given ? 'font-bold' : 'font-normal']">
      {{ cell.value }}
    </span>
    <!-- <SudokuCellNotesGrid v-else notes="cell.notes" highlight="selectedCellValue" /> -->
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
  background-color: var(--color-background);
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
