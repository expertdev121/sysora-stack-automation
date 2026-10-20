-- A send with nowhere to go used to leave only a console line. The
-- first real purchase after the confirmation hook shipped was lost
-- exactly this way, and explaining it took a database query.
alter table sales.webhooks
  add column if not exists missed_count       integer not null default 0,
  add column if not exists last_missed_at     timestamptz,
  add column if not exists last_missed_detail text;
