import { useGameTimer } from "@/hooks/useGameTimer"
import { useGameStore } from "@/stores/gameStore"
import { Button } from "../ui/button";
import { Pause, Play } from "lucide-react";

export default function GameInfos() {
  const { displayTime, formatTime } = useGameTimer();
  const { difficulty, pauseGame, resumeGame, isPaused } = useGameStore();

  return <div className="flex flex-row ww-full gap-4 items-center p-4">
    <div className="flex flex-row grow justify-between">
      <div className="flex flex-col">
        <span>Time</span>
        <span>{formatTime(displayTime)}</span>
        <span className="text-xs">{displayTime}</span>
      </div>
      <div className="flex flex-col">
        <span>Difficulty</span>
        <span>{difficulty}</span>
      </div>
    </div>
    <Button size="lg" onClick={isPaused ? resumeGame : pauseGame}>
      {isPaused ? <Play /> : <Pause />}
    </Button>
  </div>
}
