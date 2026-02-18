<script setup lang="ts">
import PauseModal from './PauseModal.vue';

const { isPaused } = storeToRefs(useGameStore());


</script>

<template>
  <PauseModal />
  <UContainer class="
    h-full w-full max-w-md
    
    flex flex-col items-center justify-center
    gap-4

    sm:gap-8
    sm:max-w-lg

    md:max-w-7xl
    md:flex-row    ">
    <div class="
      w-full
      md:min-w-md
      md:max-w-2xl
      flex flex-col
      ">
      <SudokuGameInfos />
      <SudokuBoard />
    </div>
    <SudokuGameButtons class="w-full  max-w-md shrink md:max-w-xs" />
  </UContainer>
</template>
