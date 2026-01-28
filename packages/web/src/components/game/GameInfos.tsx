import { useGameStore } from "@/stores/gameStore"

export default function GameInfos() {
  const { timeSpent, difficulty } = useGameStore()
  return <div className="w-full flex flex-row justify-between">
    <div className="flex flex-col">
      <span>Time</span>
      <span>{timeSpent}</span>
    </div>
    <div className="flex flex-col">
      <span>Difficulty</span>
      <span>{difficulty}</span>
    </div>
  </div>
}
