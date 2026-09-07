-- The catalogue as a priced menu rather than a list of pages.
--
-- price_label because the number means something different per service:
-- "Starting at $899" for a build, "Per workflow, from $499" for automation,
-- "One time $49" for the audit. One hardcoded word above the price would
-- have been wrong for most of them, and wrong about money is worse than
-- silent about it.
--
-- image_alt doubles as the placeholder caption. Every card is designed to
-- carry a screenshot and none of them have one yet; a blank grey box reads
-- as a broken image, whereas naming what belongs there turns the gap into
-- an obvious to-do. The same string becomes the alt text once a file exists.
--
-- The unique index allows exactly one featured row. Two "most requested"
-- cards is a design that has stopped meaning anything, and a partial index
-- makes that the database's problem rather than the editor's.

alter table sales.services
  add column category       text,
  add column price_label    text not null default 'Starting at',
  add column is_featured    boolean not null default false,
  add column featured_label text,
  add column image_url      text,
  add column image_alt      text;

comment on column sales.services.price_label is
  'What the price means for this service. Shown above the amount.';
comment on column sales.services.image_alt is
  'Alt text, and the caption shown in the placeholder until image_url is set.';

create unique index services_one_featured on sales.services (is_featured)
  where is_featured;
