import { useGameStore } from "@/stores/gameStore";
import { Button } from "../ui/button";

export default function NumPadButton({ num, onClick }: { num: number; onClick: () => void }) {
  const { remainingCounts } = useGameStore();

  return <Button
    className="relative flex flex-col gap-0 cursor-pointer bg-primary/5 / elevated elevated--xs"
    onClick={onClick}>
    <span className="text-xl mt-2">{num}</span>
    <div className="
      absolute
      top-1
      flex flex-row gap-0.5 flex-wrap justify-center
      w-full">
      {
        Array.from({ length: remainingCounts[num - 1] })
          .map((_, i) => <div
            className="h-1 w-1 bg-primary rounded"
            key={`remaining-indicator-${num - 1}-${i}`}></div>)
      }
    </div>
  </Button >
}
