
CREATE TABLE public.tracker_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tracker_state TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tracker_state TO authenticated;
GRANT ALL ON public.tracker_state TO service_role;

ALTER TABLE public.tracker_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tracker state"
  ON public.tracker_state FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tracker state"
  ON public.tracker_state FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tracker state"
  ON public.tracker_state FOR UPDATE
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tracker_state;
