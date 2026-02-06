"use client"

import Sudoku from "@/components/game/Sudoku";
import { gameApi } from "@/lib/api";
import { useGameStore } from "@/stores/gameStore";
import { useEffect, useState } from "react";

export default function DailyPage() {
  const [loading, setLoading] = useState(true);
  const { loadPuzzle } = useGameStore();
  useEffect(() => {
    async function fetchPuzzle() {

      const { daily, progress } = await gameApi.getTodaysPuzzle("hard");
      loadPuzzle({ puzzle: daily.puzzle, puzzleId: daily.id, puzzleDate: daily.date, progress });
      setLoading(true)

    }

    fetchPuzzle();

  }, [loadPuzzle])

  return <Sudoku />
}
