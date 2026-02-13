<script setup lang="ts">
import { getSudoku } from "sudoku-gen"
definePageMeta({
  middleware: ['authenticated']
})

const { loadPuzzle } = useGameStore();
watchEffect(() => {
  const dailySudoku = getSudoku('easy')
  loadPuzzle(dailySudoku)
})

</script>
<template>
  <div>
    <SudokuGame />
  </div>
</template>
