-- ============================================================
-- Sysora sales schema — surveys
-- Questions are data, not code.
-- ============================================================

create table sales.surveys (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  kind          sales.survey_kind not null,
  offer_id      uuid references sales.offers (id) on delete set null,
  title         text not null,
  intro         text,
  outro         text,
  submit_label  text not null default 'Submit',
  version       integer not null default 1,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table sales.surveys is 'A questionnaire. pre_checkout runs before payment, post_payment after.';
comment on column sales.surveys.version is 'Bumped when questions change materially; answers snapshot their question text regardless.';

create unique index surveys_offer_kind_active_key
  on sales.surveys (offer_id, kind)
  where is_active and offer_id is not null;

create index surveys_active_idx on sales.surveys (is_active, kind) where is_active;

create trigger surveys_set_updated_at
  before update on sales.surveys
  for each row execute function sales.set_updated_at();

-- ---- Questions ---------------------------------------------

create table sales.survey_questions (
  id            uuid primary key default gen_random_uuid(),
  survey_id     uuid not null references sales.surveys (id) on delete cascade,
  question_key  text not null,
  type          sales.question_type not null default 'short_text',
  label         text not null,
  help_text     text,
  placeholder   text,
  is_required   boolean not null default false,
  sort_order    integer not null default 0,
  options       jsonb not null default '[]'::jsonb,
  validation    jsonb not null default '{}'::jsonb,
  visible_if    jsonb,
  maps_to       text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint survey_questions_key_format check (question_key ~ '^[a-z][a-z0-9_]*$'),
  constraint survey_questions_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint survey_questions_choices_have_options check (
    type not in ('single_select', 'multi_select') or jsonb_array_length(options) > 0
  )
);

comment on table sales.survey_questions is 'Editable questions. question_key is the stable identifier answers refer to.';
comment on column sales.survey_questions.maps_to is 'Optional sales.customers column to copy this answer into.';

create unique index survey_questions_key_key on sales.survey_questions (survey_id, question_key);
create index survey_questions_order_idx on sales.survey_questions (survey_id, sort_order) where is_active;

create trigger survey_questions_set_updated_at
  before update on sales.survey_questions
  for each row execute function sales.set_updated_at();

-- ---- Responses ---------------------------------------------

create table sales.survey_responses (
  id             uuid primary key default gen_random_uuid(),
  survey_id      uuid not null references sales.surveys (id) on delete restrict,
  survey_version integer not null default 1,
  customer_id    uuid references sales.customers (id) on delete set null,
  request_id     uuid,
  status         sales.response_status not null default 'in_progress',
  session_id     text,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  ip             inet,
  user_agent     text,
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint survey_responses_completed_has_time check (
    status <> 'completed' or completed_at is not null
  )
);

comment on table sales.survey_responses is 'One submission attempt, complete or not — abandonment is data too.';

create index survey_responses_survey_idx on sales.survey_responses (survey_id, created_at desc);
create index survey_responses_customer_idx on sales.survey_responses (customer_id, created_at desc);
create index survey_responses_status_idx on sales.survey_responses (status, created_at desc);
create index survey_responses_session_idx on sales.survey_responses (session_id) where session_id is not null;
create index survey_responses_request_idx on sales.survey_responses (request_id) where request_id is not null;

create trigger survey_responses_set_updated_at
  before update on sales.survey_responses
  for each row execute function sales.set_updated_at();

-- ---- Answers -----------------------------------------------

create table sales.survey_answers (
  id              uuid primary key default gen_random_uuid(),
  response_id     uuid not null references sales.survey_responses (id) on delete cascade,
  question_id     uuid references sales.survey_questions (id) on delete set null,
  question_key    text not null,
  question_label  text not null,
  question_type   sales.question_type not null,
  value           jsonb not null,
  value_text      text,
  answered_at     timestamptz not null default now()
);

comment on table sales.survey_answers is 'Answers keep a copy of the question they answered, so history never rots.';

create unique index survey_answers_unique_key on sales.survey_answers (response_id, question_key);
create index survey_answers_question_idx on sales.survey_answers (question_id);
create index survey_answers_key_idx on sales.survey_answers (question_key);
create index survey_answers_value_idx on sales.survey_answers using gin (value jsonb_path_ops);
create index survey_answers_text_idx on sales.survey_answers
  using gin (to_tsvector('english', coalesce(value_text, '')));
