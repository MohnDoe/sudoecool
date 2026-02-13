<script setup lang="ts">
const { toggleNotesMode, clearCell } = useGameStore();
const { notesMode, selectedIndex } = storeToRefs(useGameStore());

const onRemoveButtonPress = () => {
  if (selectedIndex.value !== null) {
    clearCell(selectedIndex.value);
  }
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <USwitch size="xs" label="Fast mode" />
    <div class="flex gap-2">
      <UButton size="lg" variant="outline" class="grow relative elevated elevated--xs bg-white"
        @click="toggleNotesMode">
        <UBadge :variant="notesMode ? 'solid' : 'outline'" class="absolute top-2 right-2">
          {{ notesMode ? "On" : "Off" }}
        </UBadge>
        <UIcon name="i-lucide-pen" /> Notes
      </UButton>
      <UButton size="lg" variant="outline" class="grow elevated elevated--xs bg-white" @click="onRemoveButtonPress">
        <UIcon name="i-lucide-trash" /> Clear
      </UButton>
    </div>
    <SudokuGameNumPad />
  </div>
</template>
