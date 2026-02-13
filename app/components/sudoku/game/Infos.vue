<script setup lang="ts">
const { difficulty } = useGameStore();

const isPaused = true;

const resumeGame = () => { };
const pauseGame = () => { };
const displayTime = 0;

</script>
<template>
  <div class="flex flex-row ww-full gap-4 items-center p-4">
    <div class="flex flex-row grow justify-between">
      <div class="flex flex-col">
        <span>Time</span>
        <span class="text-xs">{{ displayTime }}</span>
      </div>
      <div class="flex flex-col">
        <span>Difficulty</span>
        <span>{{ difficulty }}</span>
      </div>
    </div>
    <UButton size="lg" @click="isPaused ? resumeGame : pauseGame">
      <UIcon :name="isPaused ? 'i-lucide-play' : 'i-lucide-pause'" />
    </UButton>
  </div>
</template>
