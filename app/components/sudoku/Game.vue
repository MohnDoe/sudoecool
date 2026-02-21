<template>
  <SudokuPauseModal />
  <SudokuVictoryModal />
  <div class="
    h-screen w-full max-w-md
    flex flex-col
    gap-4
    md:w-full
    md:min-w-2md
    md:max-w-7xl
    ">
    <SudokuGameInfos />
    <div class=" 
    flex flex-col items-center justify-center
    grow
    gap-8

    sm:gap-8
    sm:max-w-lg

    md:max-w-7xl
    md:flex-row md:items-start
      ">
      <div class="
      flex flex-col
      w-full
      h-fit
      md:pb-8
      md:w-auto
      md:h-full
      ">
        <SudokuBoard />
      </div>
      <SudokuGameButtons class="w-full max-w-md shrink md:max-w-xs md:self-auto" />
    </div>
  </div>
</template>
