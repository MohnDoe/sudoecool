import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function useGameTimer() {
  const isPaused = useGameStore((s) => s.isPaused);
  const storedTime = useGameStore((s) => s.timeSpent);
  const updateStoreTime = useGameStore((s) => s.setTimeSpent);

  // Local ticking state (for UI)
  const [displayTime, setDisplayTime] = useState(storedTime);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Sync local display when store changes (e.g. loaded game)
  useEffect(() => {
    setDisplayTime(storedTime);
  }, [storedTime]);

  // 2. Handle Running/Pausing
  useEffect(() => {
    if (isPaused) {
      // ⏸️ PAUSE: Stop ticking, calculate final delta, update store
      if (startTimeRef.current) {
        const now = Date.now();
        const delta = Math.floor((now - startTimeRef.current) / 1000);
        const newTotal = storedTime + delta;

        updateStoreTime(newTotal); // ✅ Sync to Store
        setDisplayTime(newTotal);
        startTimeRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      // ▶️ RESUME: Start ticking
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDisplayTime(storedTime + delta); // Update UI only
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, storedTime, updateStoreTime]);

  const getExactTime = useCallback(() => {
    // Case 1: Timer is running. True time = Stored + (Now - Start)
    if (!isPaused && startTimeRef.current) {
      const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
      return storedTime + delta;
    }
    // Case 2: Timer paused. True time = Stored time
    return storedTime;
  }, [isPaused, storedTime]); // Dependencies are stable enough

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return { displayTime, getExactTime, formatTime };
}
