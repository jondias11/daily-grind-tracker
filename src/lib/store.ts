import { create } from "zustand";
import { persist } from "zustand/middleware";
import seedProblems from "@/data/problems.json";
import { supabase } from "@/integrations/supabase/client";

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
  dbmsMin: number;
  dsaRecapMin: number;
};

export type Targets = {
  dsaTheory: number;
  ml: number;
  project: number;
  dbms: number;
  dsaRecap: number;
};

export type SyncStatus = "idle" | "syncing" | "synced" | "offline";

const DEFAULT_TARGETS: Targets = {
  dsaTheory: 45,
  ml: 60,
  project: 60,
  dbms: 60,
  dsaRecap: 30,
};

const EMPTY_LOG: DailyLog = {
  dsaTheoryMin: 0,
  mlMin: 0,
  projectMin: 0,
  dbmsMin: 0,
  dsaRecapMin: 0,
};

function normalizeLog(l: Partial<DailyLog> | undefined): DailyLog {
  return { ...EMPTY_LOG, ...(l ?? {}) };
}

type State = {
  problems: Problem[];
  daily: Record<string, DailyLog>;
  targets: Targets;
  syncStatus: SyncStatus;
  _hydrated: boolean;
  _remoteUpdatedAt: string | null;
  setMinutes: (date: string, key: keyof DailyLog, min: number) => void;
  addMinutes: (date: string, key: keyof DailyLog, delta: number) => void;
  toggleProblem: (id: number) => void;
  moveProblem: (id: number, toDate: string) => void;
  setTargets: (t: Partial<Targets>) => void;
  reset: () => void;
  _setSyncStatus: (s: SyncStatus) => void;
  _applyRemote: (data: { problems: Problem[]; daily: Record<string, DailyLog>; targets: Targets }, updatedAt: string) => void;
  _markHydrated: () => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      problems: seedProblems as Problem[],
      daily: {},
      targets: DEFAULT_TARGETS,
      syncStatus: "idle",
      _hydrated: false,
      _remoteUpdatedAt: null,
      setMinutes: (date, key, min) =>
        set((s) => {
          const cur = normalizeLog(s.daily[date]);
          return { daily: { ...s.daily, [date]: { ...cur, [key]: Math.max(0, min) } } };
        }),
      addMinutes: (date, key, delta) =>
        set((s) => {
          const cur = normalizeLog(s.daily[date]);
          return { daily: { ...s.daily, [date]: { ...cur, [key]: Math.max(0, cur[key] + delta) } } };
        }),
      toggleProblem: (id) =>
        set((s) => ({
          problems: s.problems.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)),
        })),
      moveProblem: (id, toDate) =>
        set((s) => ({
          problems: s.problems.map((p) => (p.id === id ? { ...p, scheduledDate: toDate } : p)),
        })),
      setTargets: (t) => set((s) => ({ targets: { ...s.targets, ...t } })),
      reset: () =>
        set({
          problems: seedProblems as Problem[],
          daily: {},
          targets: DEFAULT_TARGETS,
        }),
      _setSyncStatus: (syncStatus) => set({ syncStatus }),
      _applyRemote: (data, updatedAt) =>
        set({
          problems: data.problems,
          daily: Object.fromEntries(
            Object.entries(data.daily ?? {}).map(([k, v]) => [k, normalizeLog(v)]),
          ),
          targets: { ...DEFAULT_TARGETS, ...(data.targets ?? {}) },
          _remoteUpdatedAt: updatedAt,
        }),
      _markHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "tracker-store-v2",
      partialize: (s) => ({
        problems: s.problems,
        daily: s.daily,
        targets: s.targets,
      }),
    },
  ),
);

// ---------- Cloud sync ----------
const SINGLETON_ID = "singleton";
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

async function pushToCloud() {
  const s = useStore.getState();
  const payload = { problems: s.problems, daily: s.daily, targets: s.targets };
  useStore.getState()._setSyncStatus("syncing");
  const updated_at = new Date().toISOString();
  const { error } = await supabase
    .from("tracker_state")
    .upsert({ id: SINGLETON_ID, data: payload, updated_at }, { onConflict: "id" });
  if (error) {
    console.error("Cloud sync failed:", error);
    useStore.getState()._setSyncStatus("offline");
    return;
  }
  useStore.setState({ _remoteUpdatedAt: updated_at });
  useStore.getState()._setSyncStatus("synced");
}

function scheduleSave() {
  if (applyingRemote) return;
  if (saveTimer) clearTimeout(saveTimer);
  useStore.getState()._setSyncStatus("syncing");
  saveTimer = setTimeout(() => {
    void pushToCloud();
  }, 800);
}

export async function initCloudSync() {
  if (typeof window === "undefined") return;
  const store = useStore.getState();
  if (store._hydrated) return;

  try {
    const { data, error } = await supabase
      .from("tracker_state")
      .select("data, updated_at")
      .eq("id", SINGLETON_ID)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      applyingRemote = true;
      const remote = data.data as { problems: Problem[]; daily: Record<string, DailyLog>; targets: Targets };
      useStore.getState()._applyRemote(remote, data.updated_at as string);
      applyingRemote = false;
      useStore.getState()._setSyncStatus("synced");
    } else {
      // First run — push current local state up
      await pushToCloud();
    }
  } catch (e) {
    console.error("Cloud hydrate failed:", e);
    useStore.getState()._setSyncStatus("offline");
  }

  useStore.getState()._markHydrated();

  // Subscribe to changes from other devices
  supabase
    .channel("tracker_state_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tracker_state", filter: `id=eq.${SINGLETON_ID}` },
      (payload) => {
        const row = payload.new as { data: unknown; updated_at: string } | undefined;
        if (!row) return;
        const localTs = useStore.getState()._remoteUpdatedAt;
        if (localTs && row.updated_at <= localTs) return;
        applyingRemote = true;
        useStore.getState()._applyRemote(
          row.data as { problems: Problem[]; daily: Record<string, DailyLog>; targets: Targets },
          row.updated_at,
        );
        applyingRemote = false;
        useStore.getState()._setSyncStatus("synced");
      },
    )
    .subscribe();

  // Push on any local mutation
  useStore.subscribe((state, prev) => {
    if (applyingRemote) return;
    if (
      state.problems !== prev.problems ||
      state.daily !== prev.daily ||
      state.targets !== prev.targets
    ) {
      scheduleSave();
    }
  });
}
