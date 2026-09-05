# Vault document format

Copy this into the Google Doc the bot reads. Plain paragraphs — no tables, no
fancy formatting needed. The parser only cares about two things:

1. Every entry starts with `## Name` on its own line.
2. Everything under it is `label: value`, one per line.

Reserved labels:

| Label     | Meaning                                                           |
|-----------|-------------------------------------------------------------------|
| `aliases` | Comma-separated. What people actually call it. Helps matching.    |
| `purpose` | One line. Shown to the model to help it match. Keep it non-secret.|
| `access`  | Comma-separated group names, or `all`. Controls who may receive it.|

Every other label (`url`, `username`, `password`, `notes`, `api key`, …) is
passed through to the employee verbatim.

`aliases` and `purpose` **are** shown to the model. Everything else is not.
So do not put a secret in `purpose`.

---

## Canva Pro
aliases: canva, design tool, graphics
purpose: Team design account for social assets
url: https://canva.com/login
username: design@sysora.com
password: REPLACE-ME
access: all

## Railway
aliases: railway, hosting, deploys
purpose: Hosting for n8n and the API
url: https://railway.app
username: ops@sysora.com
password: REPLACE-ME
notes: 2FA code lives on the ops phone
access: dev, ops

## Stripe Dashboard
aliases: stripe, payments, billing
purpose: Payments and invoices
url: https://dashboard.stripe.com
username: billing@sysora.com
password: REPLACE-ME
access: finance
