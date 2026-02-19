<script setup lang="ts">

const discordStore = useDiscordStore()
const { loggedIn, ready, clear } = useUserSession()
const { $initDiscordClient } = useNuxtApp();
const isReady = computed(
  () => ready.value && discordStore.isFullyReady && loggedIn.value
)

const retryLogin = async () => {
  discordStore.reset()
  await clear();
  await $initDiscordClient();
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="discordStore.loading || !isReady" class="flex flex-col w-full h-screen justify-center items-center">
    <UIcon name="i-lucide-loader-circle" class="animate-spin text-primary size-10" />
    <p class="text-muted font-bold text-lg">Loading..</p>
  </div>

  <!-- Error state -->
  <div v-else-if="discordStore.hasError" class="flex flex-col w-full h-screen justify-center items-center gap-4">
    <h2 class="text-xl"> Authentication Error</h2>
    <p>{{ discordStore.error?.message }}</p>
    <UButton @click="retryLogin" variant="elevated" size="xl" color="secondary" icon="i-lucide-refresh-ccw">Retry
    </UButton>
  </div>

  <!-- Not authenticated (shouldn't normally happen) -->
  <div v-else-if="!loggedIn" class="flex flex-col w-full h-screen justify-center items-center gap-4">
    <p class="text-5xl text-center">Please launch this activity from Discord</p>
  </div>

  <!-- App ready -->
  <slot v-else />
</template>
