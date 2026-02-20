<script setup lang="ts">
const gameStore = useGameStore();


const infos = computed(() => ([
  {
    title: "Time",
    value: gameStore.formattedTimeSpent,
  },
  {
    title: "Mistakes",
    value: gameStore.mistakes,
  },
  {
    title: "Moves",
    value: gameStore.moves,
  },
  {
    title: "Difficulty",
    value: gameStore.difficulty
  }
]))

</script>

<template>
  <UModal :dismissible="false" :open="gameStore.isCompleted" :close="false">
    <template #body>
      <div class="flex flex-col justify-center items-center gap-10 pb-4 md:gap-5">
        <h2 class="text-3xl font-medium">🎉🎉🎉</h2>
        <span class="text-3xl font-black">You did great!</span>
        <UCard variant="solid" class="bg-white elevated">
          <div class="flex flex-row gap-10 justify-around w-full md:justify-center md:gap-10">
            <div v-for="info in infos" class="flex flex-col items-center gap-0">
              <span class="text-dimmed text-md">{{ info.title }}</span>
              <span class="text-2xl font-medium capitalize">{{ info.value }}</span>
            </div>
          </div>
        </UCard>
        <div class="flex flex-col gap-8 mt-4">
          <UButton variant="solid" size="xl" class="cursor-pointer">Share</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
