import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/AppNav";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const targets = useStore((s) => s.targets);
  const setTargets = useStore((s) => s.setTargets);
  const reset = useStore((s) => s.reset);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Card className="p-5 space-y-4">
          <h2 className="font-medium">Daily targets (minutes)</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>DSA Theory</Label>
              <Input
                type="number"
                value={targets.dsaTheory}
                onChange={(e) => setTargets({ dsaTheory: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ML</Label>
              <Input
                type="number"
                value={targets.ml}
                onChange={(e) => setTargets({ ml: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Input
                type="number"
                value={targets.project}
                onChange={(e) => setTargets({ project: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>
        <Card className="p-5 space-y-3">
          <h2 className="font-medium">Data</h2>
          <p className="text-sm text-muted-foreground">
            Your progress is saved in this browser. Reset restores the original schedule from the
            spreadsheet and clears all logs.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Reset all progress and reload the seed schedule?")) reset();
            }}
          >
            Reset all data
          </Button>
        </Card>
      </main>
    </div>
  );
}
