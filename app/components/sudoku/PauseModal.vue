<script setup lang="ts">
const gameStore = useGameStore();
const { isPaused, isCompleted } = storeToRefs(gameStore);


const infos = computed(() => ([
  {
    title: "Time",
    value: gameStore.formattedTimeSpent,
  },
  {
    title: "Difficulty",
    value: gameStore.difficulty
  }
]))

const reset = () => {
  gameStore.resetGrid();
  gameStore.unpauseGame();
}

</script>

<template>
  <UModal :dismissible="false" :open="isPaused && !isCompleted" :close="false">
    <template #body>
      <div class="flex flex-col justify-center items-center gap-10 pb-4 md:gap-5">
        <h2 class="text-3xl font-medium">Pause</h2>
        <div class="flex flex-row gap-10 justify-around w-full md:justify-center md:gap-10">
          <div v-for="info in infos" class="flex flex-col items-center gap-0">
            <span class="text-dimmed text-md">{{ info.title }}</span>
            <span class="text-2xl font-medium capitalize">{{ info.value }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-8">
          <UButton variant="elevated" size="xl" @click="gameStore.unpauseGame">Resume game</UButton>
          <UButton variant="ghost" size="xl" @click="reset" class="justify-center cursor-pointer" color="neutral">
            Reset grid
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
