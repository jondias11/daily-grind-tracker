import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { ProblemCard } from "@/components/ProblemCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/week")({
  component: WeekPage,
});

function DayColumn({ date }: { date: string }) {
  const allProblems = useStore((s) => s.problems);
  const problems = useMemo(
    () => allProblems.filter((p) => p.scheduledDate === date),
    [allProblems, date],
  );
  const dropData = useMemo(() => ({ date }), [date]);
  const { isOver, setNodeRef } = useDroppable({ id: `col-${date}`, data: dropData });
  const parsed = parseISO(date);
  const isToday = date === format(new Date(), "yyyy-MM-dd");

  return (
    <div ref={setNodeRef}>
      <Card
        className={cn(
          "flex flex-col gap-2 p-3 min-h-[300px] transition-colors",
          isOver && "ring-2 ring-primary",
          isToday && "border-primary",
        )}
      >
        <Link
          to="/day/$date"
          params={{ date }}
          className="flex items-baseline justify-between text-sm font-medium hover:underline"
        >
          <span>{format(parsed, "EEE")}</span>
          <span className="text-muted-foreground">{format(parsed, "MMM d")}</span>
        </Link>
        <div className="text-xs text-muted-foreground">
          {problems.length} problems · {problems.reduce((a, p) => a + p.estMin, 0)}m
        </div>
        <div className="space-y-1.5">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
          {problems.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Empty — drop here</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function WeekPage() {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const moveProblem = useStore((s) => s.moveProblem);
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(anchor, i), "yyyy-MM-dd"));

  const onDragEnd = (e: DragEndEvent) => {
    const pid = e.active.data.current?.problemId as number | undefined;
    const toDate = e.over?.data.current?.date as string | undefined;
    if (pid && toDate) moveProblem(pid, toDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => setAnchor(addDays(anchor, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">
            Week of {format(anchor, "MMM d, yyyy")}
          </h1>
          <Button size="icon" variant="outline" onClick={() => setAnchor(addDays(anchor, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => setAnchor(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            This week
          </Button>
        </div>
        <DndContext onDragEnd={onDragEnd}>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
            {days.map((d) => (
              <DayColumn key={d} date={d} />
            ))}
          </div>
        </DndContext>
      </main>
    </div>
  );
}
