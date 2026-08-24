-- ============================================================
-- Sysora sales schema — seed
-- Offers match the landing page. Survey questions are placeholders,
-- meant to be rewritten from the admin dashboard.
-- ============================================================

insert into sales.offers
  (slug, kind, name, tagline, price_amount, currency, billing_interval, price_note, features, sort_order)
values
  ('build-request', 'build_request', 'Submit a Build Request',
   'For when you already know what you want built.',
   0, 'USD', 'one_time', 'to submit, scoped per project',
   array[
     'Tell us the project and the problem behind it',
     'We review your requirements and current setup',
     'A call if the scope needs clarifying',
     'A proposal with recommended scope, timeline, and investment',
     'You approve it, we build'
   ], 1),
  ('systems-review', 'systems_review', 'Business Systems Review',
   'For when something is clearly inefficient and you''re not sure what to fix first.',
   4900, 'USD', 'one_time', 'one time',
   array[
     'A short questionnaire about your business, tools, and workflow',
     'The single area where automation, AI, or better design pays off most',
     'A clear recommended direction',
     'What we''d do next if it were our business'
   ], 2),
  ('systems-team', 'systems_team', 'On-Demand Systems Team',
   'For when your business runs on technology and needs someone to keep it running.',
   200000, 'USD', 'month', '/month and up, tailored',
   array[
     'Monitoring, maintenance, and troubleshooting',
     'CRM and workflow improvements',
     'Integration support and AI workflow upgrades',
     'Small builds within your plan''s capacity',
     'A monthly systems review with recommendations',
     'You send requests, we prioritise them with you'
   ], 3);

insert into sales.settings (key, value, label, description, is_public) values
  ('booking_url', '""'::jsonb, 'Booking link',
   'Where "book a call" sends people. Paste your scheduling link.', true),
  ('calendar_url', '""'::jsonb, 'Calendar link',
   'Calendar shown after a paid review, for scheduling the walkthrough.', true),
  ('contact_email', '"hello@sysora.com"'::jsonb, 'Contact email',
   'Shown on the contact page and in confirmation emails.', true),
  ('terms_url', '""'::jsonb, 'Terms URL', 'Linked from the checkout page.', true),
  ('privacy_url', '""'::jsonb, 'Privacy URL', 'Linked from the checkout page.', true),
  ('checkout_note', '"Payments are processed securely. We never see or store your card details."'::jsonb,
   'Checkout note', 'Reassurance line under the payment form.', true),
  ('notify_emails', '[]'::jsonb, 'Internal notification emails',
   'Who gets told when a request or payment lands.', false);

with o as (select id, slug from sales.offers)
insert into sales.surveys (slug, kind, offer_id, title, intro, submit_label)
select * from (values
  ('build-request-intake', 'build_request'::sales.survey_kind,
   (select id from o where slug = 'build-request'),
   'Submit a Build Request',
   'Tell us the project and the problem behind it. We''ll come back with scope, timeline, and investment.',
   'Submit request'),
  ('systems-review-pre', 'pre_checkout'::sales.survey_kind,
   (select id from o where slug = 'systems-review'),
   'Before we start',
   'Four quick questions so the review is about your business, not a template.',
   'Continue to payment'),
  ('systems-review-post', 'post_payment'::sales.survey_kind,
   (select id from o where slug = 'systems-review'),
   'Your Business Systems Review',
   'Thanks — payment received. These answers are what we actually review, so take your time.',
   'Submit answers'),
  ('systems-team-pre', 'pre_checkout'::sales.survey_kind,
   (select id from o where slug = 'systems-team'),
   'Tell us what you''re running',
   'A few questions so we can size the retainer properly.',
   'Continue'),
  ('systems-team-post', 'post_payment'::sales.survey_kind,
   (select id from o where slug = 'systems-team'),
   'Onboarding your systems team',
   'What we need to start on day one.',
   'Submit answers')
) as v(slug, kind, offer_id, title, intro, submit_label);

insert into sales.survey_questions
  (survey_id, question_key, type, label, help_text, placeholder, is_required, sort_order, options, maps_to)
select s.id, q.question_key, q.type::sales.question_type, q.label, q.help_text, q.placeholder,
       q.is_required, q.sort_order, q.options::jsonb, q.maps_to
from sales.surveys s
join (values
  ('build-request-intake', 'full_name',    'short_text',   'Your name', null, 'Jane Doe', true, 10, '[]', 'full_name'),
  ('build-request-intake', 'email',        'email',        'Work email', 'Where we send the proposal.', 'jane@company.com', true, 20, '[]', 'email'),
  ('build-request-intake', 'company_name', 'short_text',   'Company', null, 'Acme Ltd', false, 30, '[]', 'company_name'),
  ('build-request-intake', 'project',      'long_text',    'What do you want built?', 'Placeholder question — edit in the dashboard.', 'Describe the project…', true, 40, '[]', null),
  ('build-request-intake', 'problem',      'long_text',    'What problem is behind it?', 'Placeholder question — edit in the dashboard.', 'What breaks today?', false, 50, '[]', null),
  ('build-request-intake', 'tools',        'multi_select', 'Which tools are involved?', 'Placeholder question — edit in the dashboard.', null, false, 60,
   '[{"value":"n8n","label":"n8n"},{"value":"zapier","label":"Zapier"},{"value":"make","label":"Make"},{"value":"gohighlevel","label":"GoHighLevel"},{"value":"airtable","label":"Airtable"},{"value":"stripe","label":"Stripe"},{"value":"other","label":"Something else"}]', null),
  ('build-request-intake', 'timeline',     'single_select','How soon do you need it?', null, null, false, 70,
   '[{"value":"asap","label":"As soon as possible"},{"value":"month","label":"Within a month"},{"value":"quarter","label":"This quarter"},{"value":"exploring","label":"Just exploring"}]', null),

  ('systems-review-pre', 'full_name',    'short_text', 'Your name', null, 'Jane Doe', true, 10, '[]', 'full_name'),
  ('systems-review-pre', 'email',        'email',      'Work email', 'Where we send the review.', 'jane@company.com', true, 20, '[]', 'email'),
  ('systems-review-pre', 'company_name', 'short_text', 'Company', null, 'Acme Ltd', false, 30, '[]', 'company_name'),
  ('systems-review-pre', 'biggest_pain', 'long_text',  'What''s eating the most time right now?', 'Placeholder question — edit in the dashboard.', 'One or two sentences is plenty.', true, 40, '[]', null),

  ('systems-review-post', 'team_size',      'single_select','How many people work in the business?', 'Placeholder question — edit in the dashboard.', null, true, 10,
   '[{"value":"1-5","label":"1–5"},{"value":"6-20","label":"6–20"},{"value":"21-50","label":"21–50"},{"value":"50+","label":"More than 50"}]', 'company_size'),
  ('systems-review-post', 'tool_stack',     'long_text',    'Which tools does the business run on?', 'Placeholder question — edit in the dashboard.', 'CRM, forms, calendars, spreadsheets…', true, 20, '[]', null),
  ('systems-review-post', 'manual_work',    'long_text',    'Where do people copy information by hand?', 'Placeholder question — edit in the dashboard.', null, true, 30, '[]', null),
  ('systems-review-post', 'lead_flow',      'long_text',    'What happens when a new lead comes in?', 'Placeholder question — edit in the dashboard.', 'Walk us through it step by step.', false, 40, '[]', null),
  ('systems-review-post', 'existing_automations', 'boolean','Do you already have automations running?', null, null, false, 50, '[]', null),
  ('systems-review-post', 'urgency',        'scale',        'How urgent does this feel, 1 to 10?', null, null, false, 60, '[]', null),

  ('systems-team-pre', 'full_name',    'short_text', 'Your name', null, 'Jane Doe', true, 10, '[]', 'full_name'),
  ('systems-team-pre', 'email',        'email',      'Work email', null, 'jane@company.com', true, 20, '[]', 'email'),
  ('systems-team-pre', 'company_name', 'short_text', 'Company', null, 'Acme Ltd', true, 30, '[]', 'company_name'),
  ('systems-team-pre', 'scope',        'long_text',  'What would you want us looking after?', 'Placeholder question — edit in the dashboard.', null, true, 40, '[]', null),

  ('systems-team-post', 'access_owner', 'short_text','Who on your side owns tool access?', 'Placeholder question — edit in the dashboard.', 'Name and role', true, 10, '[]', null),
  ('systems-team-post', 'systems_list', 'long_text', 'List the systems we''ll be responsible for', 'Placeholder question — edit in the dashboard.', null, true, 20, '[]', null),
  ('systems-team-post', 'priorities',   'long_text', 'What should we fix in the first two weeks?', 'Placeholder question — edit in the dashboard.', null, true, 30, '[]', null)
) as q(survey_slug, question_key, type, label, help_text, placeholder, is_required, sort_order, options, maps_to)
  on q.survey_slug = s.slug;
