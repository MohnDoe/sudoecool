<script setup lang="ts">
const { difficulty } = useGameStore();
const timerStore = useGameTimerStore();

</script>
<template>
  <div class="flex flex-row ww-full gap-4 items-center p-4">
    <div class="flex flex-row grow justify-between">
      <div class="flex flex-col">
        <span>Time</span>
        <span class="text-xs">{{ timerStore.formattedTime }}</span>
      </div>
      <div class="flex flex-col">
        <span>Difficulty</span>
        <span>{{ difficulty }}</span>
      </div>
    </div>
    <UButton size="lg" @click="timerStore.isRunning ? timerStore.pause() : timerStore.start()">
      <UIcon :name="timerStore.isRunning ? 'i-lucide-pause' : 'i-lucide-play'" />
    </UButton>
  </div>
</template>
