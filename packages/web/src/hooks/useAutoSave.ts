
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { gameApi } from '@/lib/api';

/**
 * Auto-save game progress with debouncing
 * 
 * Saves every move to the server, but debounced by 2 seconds
 * to prevent spamming API on rapid moves
 * 
 * Also saves immediately when user leaves the page
 */
export function useAutoSave() {
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
  } = useGameStore();

  /**
   * Save function - calls API
   */
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
        timeSpent,
        isCompleted,
      });

      console.log('✅ Progress saved');
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  }, [puzzleId, grid, moves, hints, timeSpent, isCompleted, setIsSaving]);

  /**
   * Debounced save - waits 2 seconds after last change
   */
  const debouncedSave = useCallback(() => {
    console.log("debouceSave");
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 2000); // 2 second debounce
  }, [saveProgress]);

  /**
   * Trigger save when game state changes
   */
  useEffect(() => {
    console.log("use effect prout");
    if (puzzleId && grid) {
      debouncedSave();
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [grid, moves, hints, timeSpent, puzzleId, debouncedSave]);

  /**
   * Save immediately before page unload
   */
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     // Cancel debounced save
  //     if (saveTimeoutRef.current) {
  //       clearTimeout(saveTimeoutRef.current);
  //     }
  //
  //     // Save immediately (synchronous)
  //     if (puzzleId && grid && !saveInProgressRef.current) {
  //       // Use navigator.sendBeacon for guaranteed delivery
  //       const data = JSON.stringify({
  //         puzzleId,
  //         grid,
  //         moves,
  //         hints,
  //         timeSpent,
  //         isCompleted,
  //       });
  //
  //       navigator.sendBeacon(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/games/progress`,
  //         new Blob([data], { type: 'application/json' })
  //       );
  //     }
  //   };
  //
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  // }, [puzzleId, grid, moves, hints, timeSpent, isCompleted]);
}
