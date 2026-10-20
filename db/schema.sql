-- Optional manual setup. The application also creates this table automatically on first request.
CREATE TABLE IF NOT EXISTS webdesign_school_state (
  id integer PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
