<script setup lang="ts">
const { unpauseGame } = useGameStore();
const { isPaused } = storeToRefs(useGameStore());
</script>
<template>
  <UModal title="Game paused" :dismissible="false" :open="isPaused" :close="false" :ui="{
    overlay: 'backdrop-blur-md'
  }">
    <template #body>
      <div class="flex justify-center">
        <UButton variant="elevated" @click="unpauseGame">Resume game</UButton>
      </div>
    </template>
  </UModal>
</template>
