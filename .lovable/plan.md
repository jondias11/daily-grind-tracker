## 1. New schedule from `neetcode150_schedule_v7.xlsx`
- Parse the uploaded workbook's `Problem Tracker` sheet and regenerate `src/data/problems.json` (150 rows: id, name, category, difficulty, estMin, link, scheduledDate, completed). Pre-completed problems (1–4) start as `completed: true` with `scheduledDate: null`.
- Since the schema didn't change, no store migration is needed — but a version bump on the persisted store key (`tracker-store-v2`) will force the reseed for existing browsers.

## 2. New daily block structure
Update `targets` defaults and add two new blocks:

| Block       | Old  | New  |
|-------------|------|------|
| DSA Theory  | 60m  | 45m  |
| ML          | 60m  | 60m  |
| Project     | 120m | 60m  |
| DBMS        | —    | 60m  (new) |
| DSA Recap   | —    | 30m  (new) |

Changes:
- `DailyLog` gains `dbmsMin` and `dsaRecapMin`.
- `targets` gains `dbms: 60`, `dsaRecap: 30`.
- Day view renders 5 `BlockTracker`s in a responsive grid.
- `DailyProgress` totals include the new blocks.
- Settings page exposes inputs for all 5 targets.

## 3. Lovable Cloud sync (shared single-user)
You chose a shared account with no login UI, so we keep the app open but sync via one shared row in Cloud.

- Enable Lovable Cloud.
- Create table `public.tracker_state`:
  - `id text primary key` (always `'singleton'`)
  - `data jsonb not null`
  - `updated_at timestamptz default now()`
  - RLS enabled with public `SELECT`, `INSERT`, `UPDATE` policies to `anon` (single shared user — anyone with the URL can read/write, same as localStorage today but shared).
  - Grants: `anon` + `authenticated` get `SELECT/INSERT/UPDATE`.
- Client sync layer in `src/lib/store.ts`:
  - On app load: fetch the singleton row; if newer than local `updated_at`, hydrate the store from it; if row missing, insert current state.
  - On every store change: debounced (~800ms) upsert of `{ problems, daily, targets, updated_at }`.
  - Supabase realtime subscription to `tracker_state` so a change on device A pushes into device B within seconds.
  - Keep `zustand/persist` as an offline cache so the app still works without network.
- Small "Synced ✓ / Syncing… / Offline" indicator in `AppNav`.

## 4. Publish
- Verify build and a quick smoke check (day view renders 5 blocks, problems load, edits round-trip through Cloud).
- Publish the site and share the URL.

## Technical notes
- Parsing is a one-time build-time step; I run a Node script against the uploaded xlsx and commit the generated `problems.json` — no `xlsx` dep shipped to the client.
- All Cloud reads/writes go through `@/integrations/supabase/client` (browser publishable key). No server functions needed for this simple shared-row model.
- Because it's a single shared row with public write access, anyone who guesses/knows the URL can edit your data. If you later want per-user isolation, we swap in email/password auth and scope the row by `user_id` — small, additive change.
