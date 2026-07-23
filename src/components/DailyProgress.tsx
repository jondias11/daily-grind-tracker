import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

export function DailyProgress({ date }: { date: string }) {
  const problems = useStore((s) => s.problems);
  const log = useStore((s) => s.daily[date]);
  const targets = useStore((s) => s.targets);

  const dayProblems = problems.filter((p) => p.scheduledDate === date);
  const problemTargetMin = dayProblems.reduce((a, p) => a + p.estMin, 0);
  const problemDoneMin = dayProblems.filter((p) => p.completed).reduce((a, p) => a + p.estMin, 0);

  const totalTarget =
    problemTargetMin + targets.dsaTheory + targets.oops + targets.project + targets.dbms + targets.dsaRecap;
  const totalDone =
    problemDoneMin +
    Math.min(targets.dsaTheory, log?.dsaTheoryMin ?? 0) +
    Math.min(targets.oops, log?.oopsMin ?? 0) +
    Math.min(targets.project, log?.projectMin ?? 0) +
    Math.min(targets.dbms, log?.dbmsMin ?? 0) +
    Math.min(targets.dsaRecap, log?.dsaRecapMin ?? 0);

  const pct = totalTarget === 0 ? 0 : (totalDone / totalTarget) * 100;
  const hoursDone = (totalDone / 60).toFixed(1);
  const hoursTarget = (totalTarget / 60).toFixed(1);

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Daily Progress</h2>
        <span className="text-sm text-muted-foreground">
          {hoursDone} / {hoursTarget} hrs · {Math.round(pct)}%
        </span>
      </div>
      <Progress value={pct} className="h-3" />
    </Card>
  );
}
