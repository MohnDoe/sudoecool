<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated']
})

const { auth } = useDiscordStore();
</script>
<template>
  <div>
    <p>Daily page yay</p>
  </div>
</template>
