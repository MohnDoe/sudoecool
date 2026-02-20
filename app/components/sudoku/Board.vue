<script setup lang="ts">
import "~/assets/css/sudoku.css";

const { toggleNotesMode, selectCell, unselectCell, insertNumber, clearCell } = useGameStore();
const { selectedIndex, grid, isPaused, isCompleted } = storeToRefs(useGameStore())

const relativeMove = (arrow: string) => {
  if (selectedIndex.value == null) return;
  const row = Math.floor(selectedIndex.value / 9);
  const col = selectedIndex.value % 9;

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
}

const onKeyDown = (e: KeyboardEvent) => {
  if (isPaused.value || isCompleted.value) return;

  if (e.key === 'e') {
    toggleNotesMode();
    e.preventDefault();
    return;
  }

  if (selectedIndex.value == null) return;

  if (e.key === 'Escape') {
    unselectCell();
    e.preventDefault();
    return;
  }

  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
    relativeMove(e.key);
    return;
  }

  if (/[1-9]/.test(e.key)) {
    const num = parseInt(e.key);
    e.preventDefault();
    insertNumber(num);
    return;
  }

  if (e.key === "Basckpace" || e.key === "Delete") {
    clearCell(selectedIndex.value)
    e.preventDefault();
  }
}

const toggleSelectCell = (index: number) => {
  if (index === selectedIndex.value) {
    unselectCell();
  } else {
    selectCell(index);
  }
}

const subgrids = computed(() => {
  return Array.from({ length: GRID_SIZE }, (_, b) => {
    const bandRow = Math.floor(b / 3)
    const stackCol = b % 3

    return Array.from({ length: GRID_SIZE }, (_, i) => {
      const localRow = Math.floor(i / 3)
      const localCol = i % 3
      const flatIndex = (bandRow * 3 + localRow) * 9 + (stackCol * 3 + localCol)
      const cell: Cell = grid.value[flatIndex]!;
      return { cell, index: flatIndex }
    })
  })
})

</script>
<template>
  <div className="sudoku-board w-full p-1">
    <div className="
        sudoku-grid
        w-full aspect-square
        " tabIndex="0" @keydown="onKeyDown">
      <div v-for="(box, b) in subgrids" :key="b" class="sudoku-subgrid">
        <SudokuCell v-for="{ cell, index } in box" :index="index" :key="index" :cell="cell"
          @click="toggleSelectCell(index)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sudoku-grid {
  padding: var(--grid-padding);
  border-radius: var(--grid-border-radius);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--region-gap);
  width: 100%;
  aspect-ratio: 1 / 1;
  border-collapse: collapse;
  /* border: var(--grid-border-thickness) solid var(--grid-border-color); */
  background-color: var(--grid-background-color);

  box-shadow: 0 var(--grid-elevation) 0 var(--grid-border-thickness) var(--grid-border-color), 0 0 0 var(--grid-border-thickness) var(--grid-border-color);
}

.sudoku-subgrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--cell-gap);
}
</style>
