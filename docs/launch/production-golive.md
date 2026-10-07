# Production go-live (post–Milestone 6)

Track A from the post-M6 plan. Architecture: [ADR 0003](../adr/0003-production-deployment.md).

## 1. Hosting

1. Create three Vercel (or equivalent) projects from this monorepo:
   - Root directory / build: `apps/web`, `apps/newsroom`, `apps/control`
   - Install: `npm ci` at repo root
   - Build: `npm run build -w @campus360/web` (etc.)
2. Set env per app from `.env.example` + `JOBS_CRON_SECRET` on **control** only.
3. Domains: public apex → web; `newsroom.` / `control.` subdomains.

## 2. Supabase production checklist

- [ ] Separate production project (do not reuse local/dev as prod)
- [ ] Enable **Point-in-Time Recovery** / backups ([backups-restore.md](backups-restore.md))
- [ ] Enforce **MFA** for privileged roles: SUPER_ADMIN, PLATFORM_ADMIN, EDITOR_IN_CHIEF, COMMERCIAL_MANAGER (Auth → MFA / AAL2 policies as available)
- [ ] Confirm Auth site URLs / redirect allow-lists for newsroom + control domains
- [ ] Storage buckets private by default; public CDN only for intentional public assets
- [ ] Rotate any keys that ever appeared in chat or shared screenshots

## 3. Jobs cron

1. Generate a long random `JOBS_CRON_SECRET` (32+ bytes).
2. Set on Control host: `JOBS_CRON_SECRET=...`
3. GitHub repo secrets:
   - `CONTROL_APP_URL` = `https://control.yourdomain`
   - `JOBS_CRON_SECRET` = same value
4. Enable workflow [`.github/workflows/cron-jobs.yml`](../../.github/workflows/cron-jobs.yml) (Actions → allow scheduled workflows).
5. Smoke: `workflow_dispatch` once; confirm Control → Jobs shows new `system_job_runs`.

Manual test:

```bash
curl -X POST "$CONTROL_APP_URL/api/jobs/tick" \
  -H "Authorization: Bearer $JOBS_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d "{}"
```

## 4. Staging smoke

Run [staging-smoke.md](staging-smoke.md) against staging URLs before production cutover.

## 5. Drills

Execute [drills.md](drills.md) on staging and log in [drill-log.md](drill-log.md).

## 6. Cutover

1. DNS → production
2. Freeze risky schema changes for 24h
3. Watch `/api/health` on all three apps
4. First scheduled-publish and opportunity-expire confirmation via Jobs UI
