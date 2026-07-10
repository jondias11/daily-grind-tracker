
## Overview
A single-user tracker web app seeded from your uploaded `neetcode150_schedule_v2.xlsx`. Each day shows DSA problems (from Problem Tracker), 1h DSA Theory, 1h ML, 2h Project. You log minutes done per block, see remaining time, and drag problems/blocks between days. Data persists in the browser (localStorage) — no login required. We can move to Lovable Cloud later if you want cross-device sync.

## Data model (localStorage)
- `problems[]` — seeded once from the Excel `Problem Tracker` sheet: `{id, name, category, difficulty, estMin, link, scheduledDate, status}`
- `daily[date]` — per-day time logs: `{ dsaTheoryMin, mlMin, projectMin, problemsSolvedMin }` (problem time derived from solved problems' estMin, or manually adjustable)
- `targets` — `{ dsaTheory: 60, ml: 60, project: 120 }` (editable in settings)

The Excel is parsed once at build time into a JSON file (`src/data/schedule.json`) shipped with the app; localStorage overrides it as you edit.

## Screens (routes)
- `/` — Today view (default landing)
- `/day/$date` — any specific date
- `/week` — 7-day overview grid, drag problems between days
- `/settings` — daily hour targets, reset/export data

## Today view layout
```text
 ┌─ Daily Progress ────────────────────────────┐
 │  3.2 / 4.9 hrs   [████████░░░░░]  65%       │
 ├─────────────────────────────────────────────┤
 │  DSA Problems   [██████░░] 90/150 min  [+15]│
 │  DSA Theory     [████░░░░] 30/60  min  [+15]│
 │  ML             [██░░░░░░] 15/60  min  [+15]│
 │  Project        [███░░░░░] 45/120 min  [+15]│
 └─────────────────────────────────────────────┘

 Today's Problems (Sat Jul 11)
 [ ] #5  Top K Frequent Elements    M  30m  ↗
 [ ] #6  Encode and Decode Strings  M  30m  ↗
 ...
```
Each block has: progress bar, "minutes done" number input, quick +15/+30 buttons, and remaining-time label. Problems have a checkbox (marks solved → adds estMin to DSA problems total) and drag handle.

## Drag-to-move (between days)
- Library: `@dnd-kit/core` + `@dnd-kit/sortable` (Worker-safe, pure JS).
- Drag a problem card on Today or Week view onto another day → updates its `scheduledDate` in localStorage.
- Whole-block dragging is out of scope initially (blocks are fixed per day); we move individual problems.

## Tech
- Route files under `src/routes/`: `index.tsx` (redirects to today), `day.$date.tsx`, `week.tsx`, `settings.tsx`.
- Reuse shadcn `Progress`, `Card`, `Button`, `Input`, `Checkbox`.
- Zustand (tiny store) wrapping localStorage for reactive updates.
- Seed script: a one-time Node script parses the xlsx to `src/data/schedule.json` (committed).

## Build steps
1. Add deps: `@dnd-kit/core`, `@dnd-kit/sortable`, `zustand`, `date-fns`, `xlsx` (build-time only).
2. Parse the uploaded Excel → `src/data/schedule.json` (problems + per-day blocks).
3. Create Zustand store with localStorage persistence + seeding logic.
4. Build shared components: `DailyProgress`, `BlockTracker`, `ProblemCard`.
5. Implement `/` (Today), `/day/$date`, `/week` with dnd-kit, `/settings`.
6. Style with the existing design tokens; add a light nav bar with date picker + prev/next day.
7. Verify: load app, log some minutes, drag a problem to tomorrow, refresh → state persists.

## Out of scope (ask if you want them)
- Cloud sync / multi-device (would need Lovable Cloud + auth)
- Notifications / timers / streaks
- Editing problem list beyond moving days
