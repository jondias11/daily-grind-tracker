import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, type DailyLog } from "@/lib/store";

type Props = {
  date: string;
  label: string;
  keyName: keyof DailyLog;
  targetMin: number;
};

export function BlockTracker({ date, label, keyName, targetMin }: Props) {
  const value = useStore((s) => s.daily[date]?.[keyName] ?? 0);
  const setMinutes = useStore((s) => s.setMinutes);
  const addMinutes = useStore((s) => s.addMinutes);
  const pct = Math.min(100, targetMin === 0 ? 0 : (value / targetMin) * 100);
  const remaining = Math.max(0, targetMin - value);

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value} / {targetMin} min · {remaining} left
        </span>
      </div>
      <Progress value={pct} />
      <div className="flex items-center gap-2 pt-1">
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setMinutes(date, keyName, Number(e.target.value) || 0)}
          className="w-24"
        />
        <Button size="sm" variant="secondary" onClick={() => addMinutes(date, keyName, 15)}>
          +15
        </Button>
        <Button size="sm" variant="secondary" onClick={() => addMinutes(date, keyName, 30)}>
          +30
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setMinutes(date, keyName, 0)}>
          Reset
        </Button>
      </div>
    </Card>
  );
}
