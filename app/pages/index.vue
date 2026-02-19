<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated']
})
</script>
<template>
  <div class="flex flex-col gap-4 justify-center items-center h-screen w-full">
    <span class="text-toned">Mon, Feb 16</span>
    <UButton class="font-black text-xl" variant="elevated" color="primary" size="xl" :to="{ name: 'daily' }">
      Play daily
    </UButton>
  </div>
</template>
