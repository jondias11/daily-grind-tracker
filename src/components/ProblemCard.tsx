import { useDraggable } from "@dnd-kit/core";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, GripVertical } from "lucide-react";
import { useStore, type Problem } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProblemCard({ problem, draggable = true }: { problem: Problem; draggable?: boolean }) {
  const toggle = useStore((s) => s.toggleProblem);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `problem-${problem.id}`,
    data: { problemId: problem.id },
    disabled: !draggable,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  const diffColor =
    problem.difficulty === "Easy"
      ? "bg-green-500/15 text-green-700 dark:text-green-400"
      : problem.difficulty === "Medium"
        ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
        : "bg-red-500/15 text-red-700 dark:text-red-400";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2.5 text-sm",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      {draggable && (
        <button
          {...listeners}
          {...attributes}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <Checkbox checked={problem.completed} onCheckedChange={() => toggle(problem.id)} />
      <span className="w-8 text-muted-foreground tabular-nums">#{problem.id}</span>
      <span className={cn("flex-1 truncate", problem.completed && "line-through text-muted-foreground")}>
        {problem.name}
      </span>
      <Badge variant="secondary" className={cn("text-xs", diffColor)}>
        {problem.difficulty[0]}
      </Badge>
      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{problem.estMin}m</span>
      <a
        href={problem.link}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
