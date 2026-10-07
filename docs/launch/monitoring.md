# Monitoring

## Always-on checks

| Check | Where | Action if bad |
|-------|-------|---------------|
| `GET /api/health` (web) | Uptime monitor | Page Platform |
| `GET /api/health` (newsroom) | Uptime monitor | Page Platform |
| `GET /api/health` (control) | Uptime monitor | Page Platform |
| Control → Health (DB + Search) | Daily glance | Investigate Search/DB |
| Control → Jobs failed (7d) | Overview widget | Retry / fix tick |
| Audit spikes (role changes) | Audit | Confirm intentional |

## Jobs

- Manual: Control `/jobs` or Newsroom `/jobs` or `npm run jobs:tick`
- Production: GitHub Actions schedule → `POST {CONTROL_APP_URL}/api/jobs/tick` with `JOBS_CRON_SECRET` (see [production-golive.md](production-golive.md) and ADR 0003)
- Interval: every 10 minutes (adjust in `.github/workflows/cron-jobs.yml`)

## Alerts (minimum)

1. Health 5xx for 3 consecutive probes
2. Job FAILED for `article.publish_scheduled_system` or `opportunity.expire`
3. Cron workflow failure in GitHub Actions
4. Error rate spike on public origin

Wire to email/Slack when the ops channel is chosen.
