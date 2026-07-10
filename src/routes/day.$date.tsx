import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { addDays, format, parseISO } from "date-fns";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { AppNav } from "@/components/AppNav";
import { DailyProgress } from "@/components/DailyProgress";
import { BlockTracker } from "@/components/BlockTracker";
import { ProblemCard } from "@/components/ProblemCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/day/$date")({
  component: DayPage,
});

function TomorrowDrop({ date }: { date: string }) {
  const { isOver, setNodeRef } = useDroppable({ id: `drop-${date}`, data: { date } });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground transition-colors ${
        isOver ? "border-primary bg-primary/10 text-foreground" : ""
      }`}
    >
      Drop here to move to {format(parseISO(date), "EEE MMM d")}
    </div>
  );
}

function DayPage() {
  const { date } = Route.useParams();
  const navigate = useNavigate();
  const problems = useStore((s) => s.problems);
  const targets = useStore((s) => s.targets);
  const moveProblem = useStore((s) => s.moveProblem);

  const dayProblems = problems.filter((p) => p.scheduledDate === date);
  const parsed = parseISO(date);
  const prev = format(addDays(parsed, -1), "yyyy-MM-dd");
  const next = format(addDays(parsed, 1), "yyyy-MM-dd");

  const onDragEnd = (e: DragEndEvent) => {
    const pid = e.active.data.current?.problemId as number | undefined;
    const toDate = e.over?.data.current?.date as string | undefined;
    if (pid && toDate) moveProblem(pid, toDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button asChild size="icon" variant="outline">
              <Link to="/day/$date" params={{ date: prev }}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">{format(parsed, "EEEE, MMM d, yyyy")}</h1>
            <Button asChild size="icon" variant="outline">
              <Link to="/day/$date" params={{ date: next }}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) =>
              e.target.value && navigate({ to: "/day/$date", params: { date: e.target.value } })
            }
            className="rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>

        <DndContext onDragEnd={onDragEnd}>
          <DailyProgress date={date} />

          <div className="grid gap-3 md:grid-cols-3">
            <BlockTracker date={date} label="DSA Theory" keyName="dsaTheoryMin" targetMin={targets.dsaTheory} />
            <BlockTracker date={date} label="ML" keyName="mlMin" targetMin={targets.ml} />
            <BlockTracker date={date} label="Project" keyName="projectMin" targetMin={targets.project} />
          </div>

          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">DSA Problems ({dayProblems.length})</h2>
              <span className="text-sm text-muted-foreground">
                {dayProblems.filter((p) => p.completed).length} solved
              </span>
            </div>
            {dayProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No problems scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {dayProblems.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </div>
            )}
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <TomorrowDrop date={prev} />
            <TomorrowDrop date={next} />
          </div>
        </DndContext>
      </main>
    </div>
  );
}
