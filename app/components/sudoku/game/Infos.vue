<script setup lang="ts">
const gameStore = useGameStore();

</script>
<template>
  <div class="flex flex-row w-full gap-4 items-center p-4">
    <div class="flex flex-row grow justify-between">
      <div class="flex flex-col">
        <span>Time</span>
        <span class="text-xs">{{ gameStore.formattedTimeSpent }}</span>
      </div>
      <div class="flex flex-col">
        <span>Mistakes</span>
        <span>{{ gameStore.mistakes }}</span>
      </div>
      <div class="flex flex-col">
        <span>Difficulty</span>
        <span>{{ gameStore.difficulty }}</span>
      </div>
    </div>
    <UButton size="lg" @click="gameStore.isPaused ? gameStore.unpauseGame() : gameStore.pauseGame()"
      :disabled="gameStore.isCompleted">
      <UIcon :name="gameStore.isPaused ? 'i-lucide-play' : 'i-lucide-pause'" />
    </UButton>
  </div>
</template>
