<script setup lang="ts">
const discordSdk = useDiscordSDK();
const discordStore = useDiscordStore();
const { status } = storeToRefs(discordStore);

watchEffect(async () => {
  if (status.value != 'authenticated') {
    try {
      await discordSdk.authenticate();
    } catch (error) {

    }
  }
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout v-if="status == 'authenticated'">
        <NuxtPage />
      </NuxtLayout>
      <div v-else>
        <div class="
          loading-content /
          flex h-screen w-full flex-col gap-4 
          content-center justify-center text-center items-center
          ">
          <UIcon class="spinner size-10 animate-spin" name="i-lucide-loader-circle" />
          <span>Loading..</span>
        </div>
      </div>
    </UMain>
  </UApp>
</template>

<style lang="scss" scoped></style>
