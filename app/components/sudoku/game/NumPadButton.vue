<script setup lang="ts">
const { num } = defineProps<{
  num: number;
}>();

const { insertNumber } = useGameStore();
const { remainingCount } = storeToRefs(useGameStore());

const done = computed(() => remainingCount.value(num) <= 0);

</script>
<template>

  <UButton class="relative flex flex-col gap-0 cursor-pointer bg-white / elevated elevated--xs" variant="outline"
    @click="done ? null : insertNumber(num)">
    <UIcon v-if="done" name="i-lucide-check" class="stroke-green-900" />
    <span v-if="!done" class="text-xl mt-2">{{ num }}</span>
    <div v-if="!done" class="
      absolute
      top-1
      flex flex-row gap-0.5 flex-wrap justify-center
      w-full">
      <div v-for="i in remainingCount(num)" class="h-1 w-1 bg-primary rounded"
        :key="`remaining-indicator-${num - 1}-${i}`" />
    </div>
  </UButton>

</template>
