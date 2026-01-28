import { GRID_SIZE } from "@sudoecool/shared";
import NumPadButton from "./NumPadButton";

export default function NumPad({
  onButtonPress
}: {
  onButtonPress: (num: number) => void
}) {
  return <div className="grid gap-2 gap-y-3 grid-cols-3">
    {
      Array(GRID_SIZE).fill(null).map((_, i) => {
        return <NumPadButton key={`numpad-button-${i}`} num={i + 1} onClick={() => onButtonPress(i + 1)} />
      })
    }
  </div >
}
