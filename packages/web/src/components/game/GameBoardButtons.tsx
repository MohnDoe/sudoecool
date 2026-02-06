import { useGameStore } from "@/stores/gameStore";
import { Pen, Trash } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import NumPad from "./NumPad";

export default function GameBoargButtons({
  onNumPadButtonPress,
  onRemoveButtonPress,
  onNotesButtonPress
}: {
  onNumPadButtonPress: (num: number) => void,
  onRemoveButtonPress: () => void,
  onNotesButtonPress: () => void
}) {
  const { notesMode } = useGameStore()
  return <div className="flex flex-col gap-4">
    <div className="flex items-center space-x-2">
      <Label htmlFor="fast-mode">Fast Mode</Label>
      <Switch id="fast-mode" defaultChecked />
    </div>
    <div className="flex gap-2">
      <Button size="2lg" variant="outline" className="grow relative elevated elevated--xs bg-white" onClick={onNotesButtonPress}>
        <Badge variant={notesMode ? 'default' : 'outline'} className="absolute top-2 right-2">{notesMode ? "On" : "Off"}</Badge>
        <Pen />
        Notes
      </Button>
      <Button size="2lg" variant="outline" className="grow elevated elevated--xs bg-white" onClick={onRemoveButtonPress}>
        <Trash /> Clear
      </Button>
    </div>
    <NumPad onButtonPress={onNumPadButtonPress} />
  </div>
}
