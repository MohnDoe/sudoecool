import { includes } from "zod/v4";
import type { PostProgressBody } from "~~/server/api/games/progress.post";

export function useGameSync(saveIntervalMs: number = 3_000) {
  const gameStore = useGameStore();
  const { puzzleId } = storeToRefs(gameStore);
  const { loggedIn, user } = useUserSession();

  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const performSave = async () => {
    if (!puzzleId.value || !loggedIn.value) return;

    gameStore.isSaving = true;
    try {
      const trueTimeMs = gameStore.currentTimeSpentMs;

      await $fetch('/api/games/progress', {
        method: 'POST',
        body: {
          puzzleId: puzzleId.value!,
          currentState: gameStore.grid,
          hints: gameStore.hints,
          userId: user.value!.id,
          moves: gameStore.moves,
          timeSpent: Math.floor(trueTimeMs / 1000),
          isCompleted: false // TODO: 
        } satisfies PostProgressBody
      })
      console.log("✅ Saved")
    } catch (error) {
      console.error("❌Save failed", error);
    } finally {
      gameStore.isSaving = false;
    }
  }

  const debouncedSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(performSave, 2000)
  }

  // Periodic autosave loop
  const startPeriodicSave = () => {
    if (intervalId) return; // Prevent multiple intervals

    intervalId = setInterval(async () => {
      // Only save if not already saving and conditions met
      if (!gameStore.isSaving && puzzleId.value && loggedIn.value) {
        await performSave();
      }
    }, saveIntervalMs);
  };

  gameStore.$onAction((action) => {
    const actionsToSave: Array<typeof action.name> = [
      'pauseGame',
      'insertNumber',
      'clearCell',
    ]

    if (actionsToSave.includes(action.name)) {
      action.after(debouncedSave)
    }
  })

  // Lifecycle management
  onMounted(() => {
    startPeriodicSave(); // Start autosave loop when component mounts
  });

  onBeforeUnmount(() => {
    if (saveTimeout) clearTimeout(saveTimeout)
    if (intervalId) clearInterval(intervalId);
    performSave() // Final save
  })

  return {
    performSave
  }
}
