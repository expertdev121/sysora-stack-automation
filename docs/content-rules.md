# Content rules

House style for anything a customer reads: body copy, headings, meta
descriptions, alt text, button labels, page titles, email payloads.
These are the client's rules, not preferences, and the last sweep
brought the live site to zero violations.

## Punctuation

- **No em-dashes.** Use a comma, a full stop, or a line break.
- **No double dashes.**
- **No semicolons** in prose. In code they are syntax and fine.
- Titles join with a pipe: `Page Name | Sysora Stack`. This is set by
  the template in `src/app/layout.tsx`, so it reaches every page.

## Banned words

genuinely, honestly, actually, really, truly, delve, robust, seamless,
holistic, nuanced, resonate, journey, foster, comprehensive,
meticulous, furthermore, moreover, synergy, leverage as a verb,
ecosystem, revolutionary, game-changing, cutting-edge, best-in-class,
digital transformation, unpack, deep dive, utilize.

**Text inside client quotation marks is exempt.** One Upwork review on
the homepage contains "Genuinely" and stays as written, because editing
a quotation would misrepresent it.

## Claims

- **Never state a response time, a minutes figure as a promise, or a
  business-day window.** The FAQ says plainly that no response-time
  commitment is published, because none has been operationalised. The
  15-minute billing increment is not a response time and is fine.
- Prices do not change without being asked for. One-time packs are 60
  days. Monthly resets each cycle with no rollover.
- Cancellation is **at least 24 hours before renewal**, everywhere. The
  terms require it, so the hero, the checkout, the FAQ and the refund
  rules all have to agree. They were contradictory once.

## Naming

- The client portal is **"your account"**. Never name the product and
  never show its URL in customer-facing copy.
- One email address, **support@sysorastack.com**. It was split three
  ways across the site once.

## Checkout URLs

Only ever `/checkout/hours?hours={5,10,25,50,75,100,150}&billing={once,monthly}`.
This includes the resume link in the abandoned-cart payload.

## Sweeping

Check the **rendered HTML of the live pages**, not the source. Source
greps hit code comments and miss anything a template generates, such as
the title suffix. The script used for the last sweep pulls every public
page, strips script and style, and checks visible text, every meta tag
and every `alt`, exempting text inside quotation marks.
