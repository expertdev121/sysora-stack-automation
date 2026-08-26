# Two query defects, found and fixed

Both came out of `EXPLAIN ANALYZE` rather than a hunch, and neither was
visible at the volume the business runs at today. They were fixed on
2026-08-27 because the cost of both grows with every payment recorded.

## 1. The date cast defeated the payments index

Every date filter on payments reads

```sql
(succeeded_at at time zone 'UTC')::date
```

An expression on the left of a comparison cannot use an index on the
bare column, so `payments_succeeded_idx` sat unused and the planner fell
back to a sequential scan — while `manual_revenue` beside it used its
index happily, because `earned_on` is a plain date.

The fix is an index on the expression itself:

```sql
create index payments_succeeded_day_idx
  on sales.payments (((succeeded_at at time zone 'UTC')::date))
  where status = 'succeeded' and succeeded_at is not null;
```

Proved with `enable_seqscan = off`:

```
Index Scan using payments_succeeded_day_idx on payments
  Index Cond: (((succeeded_at AT TIME ZONE 'UTC')::date >= …) AND (… <= …))
```

At 17 rows the planner still picks a sequential scan, and it is right
to — the index earns its place as the table grows, not before.

## 2. daily_money scanned payments 360 times per render

The view asked for the same checkout total twice — once for
`revenue_checkout` and again inside `revenue` — as correlated
subqueries over 180 generated days.

```
Seq Scan on payments (loops=180)   ← SubPlan 1
Seq Scan on payments (loops=180)   ← SubPlan 3, identical
```

Rewritten so each source is aggregated once, bounded to the same
window, and joined on:

```
Hash Left Join
  ->  Function Scan on generate_series
  ->  HashAggregate → Seq Scan on payments   (once)
  ->  HashAggregate → Seq Scan on manual_revenue
  ->  HashAggregate → Seq Scan on expenses
```

**900 scans → 3.** Execution time 4.810 ms → 0.606 ms at 17 payments;
the gap widens with every row.

## What was NOT a problem

An earlier note claimed the two Next.js apps risked exhausting the
60-connection limit. That was wrong: both talk to PostgREST over HTTP
through `supabase-js` and hold no Postgres connections of their own.
The connection pooler matters for the **product app**, which uses Prisma
and connects to Postgres directly — that one should use the pooler on
port 6543 rather than the direct connection.
