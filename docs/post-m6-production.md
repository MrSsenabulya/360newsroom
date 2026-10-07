# Post–Milestone 6 — Production go-live track

Default track after M6 (Guide V1.1 deferred without evidence).

## Delivered

- [ADR 0003](adr/0003-production-deployment.md) — Vercel apps + Supabase + GitHub Actions cron
- Control `POST /api/jobs/tick` authenticated with `JOBS_CRON_SECRET`
- System scheduled Article publish when cron runs (no human session)
- Workflow [`.github/workflows/cron-jobs.yml`](../.github/workflows/cron-jobs.yml)
- Ops: [production-golive.md](launch/production-golive.md), [staging-smoke.md](launch/staging-smoke.md), `npm run smoke:staging`
- MFA/PITR steps in backups + readiness checklist

## Operator next steps

1. Set `JOBS_CRON_SECRET` in Control production env and GitHub secrets
2. Set `CONTROL_APP_URL` GitHub secret
3. Enable scheduled Actions; run `workflow_dispatch` once
4. Complete Supabase PITR + MFA
5. Run drills and fill `launch/drill-log.md`
