import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { gameApi } from '@/lib/api';

export function useGameSync({
  getTime
}: {
  getTime: () => number
}) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  const {
    puzzleId,
    grid,
    moves,
    hints,
    timeSpent,
    isCompleted,
    setIsSaving,
    isPaused
  } = useGameStore();

  const saveProgress = useCallback(async () => {
    if (!puzzleId || !grid || saveInProgressRef.current) {
      return;
    }

    try {
      saveInProgressRef.current = true;
      setIsSaving(true);

      await gameApi.saveProgress({
        puzzleId,
        grid,
        moves,
        hints,
        timeSpent: getTime(),
        isCompleted,
      });

      console.log('✅ Progress saved');
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  }, [puzzleId, grid, moves, hints, isCompleted, setIsSaving, getTime]);


  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 750);
  }, [saveProgress]);

  /**
   * Trigger save when game state changes
   */
  useEffect(() => {
    if (puzzleId && grid) {
      debouncedSave();
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [grid, moves, hints, timeSpent, puzzleId, debouncedSave, isPaused]);


  // AUTO-SAVE at regular interval
  useEffect(() => {
    if (isPaused || !puzzleId) return;

    const interval = setInterval(saveProgress, 30_000);
    return () => clearInterval(interval);
  }, [saveProgress, isPaused, puzzleId]);

  /**
   * Save immediately before page unload
   * TODO: handle discord SDK exit activity
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (puzzleId && grid && !saveInProgressRef.current) {
        const data = JSON.stringify({
          puzzleId,
          grid,
          moves,
          hints,
          timeSpent: getTime(),
          isCompleted,
        });

        navigator.sendBeacon(
          `/api/games/progress`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [puzzleId, grid, moves, hints, isCompleted, getTime]);

}
