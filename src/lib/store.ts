import { create } from "zustand";
import { persist } from "zustand/middleware";
import seedProblems from "@/data/problems.json";

export type Problem = {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  estMin: number;
  link: string;
  scheduledDate: string | null;
  completed: boolean;
};

export type DailyLog = {
  dsaTheoryMin: number;
  mlMin: number;
  projectMin: number;
};

type State = {
  problems: Problem[];
  daily: Record<string, DailyLog>;
  targets: { dsaTheory: number; ml: number; project: number };
  setMinutes: (date: string, key: keyof DailyLog, min: number) => void;
  addMinutes: (date: string, key: keyof DailyLog, delta: number) => void;
  toggleProblem: (id: number) => void;
  moveProblem: (id: number, toDate: string) => void;
  setTargets: (t: Partial<State["targets"]>) => void;
  reset: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      problems: seedProblems as Problem[],
      daily: {},
      targets: { dsaTheory: 60, ml: 60, project: 120 },
      setMinutes: (date, key, min) =>
        set((s) => {
          const cur = s.daily[date] ?? { dsaTheoryMin: 0, mlMin: 0, projectMin: 0 };
          return {
            daily: {
              ...s.daily,
              [date]: { ...cur, [key]: Math.max(0, min) },
            },
          };
        }),
      addMinutes: (date, key, delta) =>
        set((s) => {
          const cur = s.daily[date] ?? { dsaTheoryMin: 0, mlMin: 0, projectMin: 0 };
          return {
            daily: {
              ...s.daily,
              [date]: { ...cur, [key]: Math.max(0, cur[key] + delta) },
            },
          };
        }),
      toggleProblem: (id) =>
        set((s) => ({
          problems: s.problems.map((p) =>
            p.id === id ? { ...p, completed: !p.completed } : p,
          ),
        })),
      moveProblem: (id, toDate) =>
        set((s) => ({
          problems: s.problems.map((p) =>
            p.id === id ? { ...p, scheduledDate: toDate } : p,
          ),
        })),
      setTargets: (t) => set((s) => ({ targets: { ...s.targets, ...t } })),
      reset: () =>
        set({
          problems: seedProblems as Problem[],
          daily: {},
          targets: { dsaTheory: 60, ml: 60, project: 120 },
        }),
    }),
    { name: "tracker-store-v1" },
  ),
);

export function problemsForDate(problems: Problem[], date: string) {
  return problems.filter((p) => p.scheduledDate === date);
}

export function dayTotals(
  problems: Problem[],
  log: DailyLog | undefined,
  targets: State["targets"],
) {
  const dayProblems = problemsForDate(problems, "___"); // unused, keep signature
  void dayProblems;
  const l = log ?? { dsaTheoryMin: 0, mlMin: 0, projectMin: 0 };
  return {
    log: l,
    targets,
  };
}
