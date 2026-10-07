# ADR 0003 — Production deployment shape (interim)

- Status: Accepted (interim; revisit if cost/jobs constraints change)
- Date: 2026-09-09

## Context

`Guide/open-decisions.md` leaves deployment provider open. Post–Milestone 6 we need a concrete go-live shape that:

- hosts three Next.js apps (`web`, `newsroom`, `control`);
- keeps Supabase Auth + Postgres + Storage (ADR 0001);
- runs temporal jobs on a schedule (opportunities expire, event status, scheduled publish);
- avoids assuming a long-lived custom worker process on day one.

## Decision

1. **Apps**: Deploy each Next app to **Vercel** (or equivalent Node-friendly Next host) as separate projects/domains:
   - public web
   - newsroom
   - control
2. **Data/auth/storage**: Remain on **Supabase** (hosted Postgres + Auth + Storage).
3. **Jobs**: Invoke `POST /api/jobs/tick` on the Control origin every **10 minutes**, authenticated with `JOBS_CRON_SECRET` (Bearer). Prefer **GitHub Actions** `schedule` for the first production cron; swap to the host’s cron or a worker later without changing job semantics.
4. **Secrets**: `JOBS_CRON_SECRET`, database URLs, and Supabase keys live only in host/CI secret stores — never in git.

## Consequences

- Persistent in-process cron inside Next is not required for V1.
- Scheduled Article publish runs as a **system** job (audit with null actor) when triggered by the cron secret.
- If Vercel limits or cost become an issue, move apps to another Next host; keep the same `/api/jobs/tick` contract.
- Multi-instance rate limits remain in-memory until Redis/Upstash is chosen.
