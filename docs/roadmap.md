# Where we are

Last reviewed 20 October 2026.

## v1, live

The public site, the checkout, the client portal and the admin console
are all in production on `www.sysorastack.com`.

- One offer: prepaid hour packs, seven sizes, $19 an hour to $13.
- Checkout with Stripe Payment Element, one-time or monthly.
- Client portal: balance, hours ledger, tasks, invoices, build
  requests, support tickets, in-portal purchasing, password change.
- Admin console: operations overview, clients and health, time logging,
  tickets, build requests, orders, contacts, settings.
- Abandoned-cart webhook to GoHighLevel, swept every five minutes.
- Payment-confirmation webhook, which also provisions the portal
  account and carries its six-digit code.
- Terms, privacy policy, contact, book a call with the GHL calendar.
- SEO: one canonical domain, sitemap, robots with AI-crawler rules, the
  old catalogue 308ing to `/`.

## Known gaps in v1

Deliberate, with a reason. Do not treat these as bugs to fix without
checking the reason still holds.

### Stripe is in test mode and the webhook secret is unset
**Deferred to the live-key flip.** `STRIPE_WEBHOOK_SECRET` goes in at
the same time as the live Stripe keys.

Until then the only thing that marks an order paid is the buyer landing
on the confirmation page. A customer who pays and closes the tab gets
no hours, no portal account and no email, and the abandoned-cart
sequence will chase them. The stopgap is manual: payers are removed
from the GHL sequence by hand.

This is the single highest-value thing to finish.

### The repeat-purchase webhook has no URL
**v2.** The `hours_topped_up` hook is built, registered and testable,
but no GoHighLevel trigger has been created for it, so a returning
client who buys more hours triggers nothing. First-time buyers are
unaffected. Create the trigger in GHL, then test and save it at
**Admin, Settings**.

### Nothing on the site sends email directly
Every email is GoHighLevel's, driven by the webhooks. There is no
transactional mail from the application, by design. It does mean the
copy on the homepage and checkout promises account access by email, and
that promise is only as good as the webhook chain above it.

### The portal has no forgot-password flow
A client who loses their password needs a staff member to reset it.
`password_resets` exists as a table but no route uses it.

### `contact_messages` has no admin UI
The contact form writes to the table and nothing reads it in the
console. Query it directly until someone builds the page.

### Two unbuilt designs
`Sysora GoHighLevel Services.dc.html` and `Sysora Order Complete.dc.html`
exist in the design project with no implementation. `Sysora Blog.dc.html`
is designed and also unbuilt; blogs were explicitly deferred.

## v2, planned

- Flip Stripe to live keys and set `STRIPE_WEBHOOK_SECRET`.
- Create and wire the repeat-purchase GoHighLevel trigger.
- Forgot-password for the portal.
- An inbox for `contact_messages` in the console.
- Blog.

## Things that are done and should not be redone

Each of these was a deliberate removal. Re-adding them would be a
regression.

- The `/services` catalogue and the $49 Business Systems Review. Gone,
  redirected, and the copy that referenced them has been rewritten.
- The worked-example refund table on the homepage. Removed from the
  design, so removed from the build.
- The badges floating off the audience illustrations. In no version of
  the design, and they clipped the viewport on mobile.
- Em-dashes and semicolons in customer-facing copy. See
  [content-rules.md](content-rules.md).
