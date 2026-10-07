# Staging smoke script

Run against staging (or local) after deploy. Replace base URLs as needed.

```bash
# PowerShell-friendly: set env then run bash/curl, or use Invoke-WebRequest equivalents.

$WEB = "http://localhost:3000"
$NEWSROOM = "http://localhost:3001"
$CONTROL = "http://localhost:3002"

# Health
curl -fsS "$WEB/api/health"
curl -fsS "$NEWSROOM/api/health"
curl -fsS "$CONTROL/api/health"

# Public P0 routes (expect 200)
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/latest"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/opportunities"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/events"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/guide"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/search?q=makerere"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/privacy"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/tip"
curl -fsS -o /dev/null -w "%{http_code}\n" "$WEB/sitemap.xml"

# Jobs tick unauthorized must 401 when secret configured
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$CONTROL/api/jobs/tick"
# Expect 401 or 503 (503 if JOBS_CRON_SECRET unset in local)

# Jobs tick authorized (set JOBS_CRON_SECRET in shell)
# curl -fsS -X POST "$CONTROL/api/jobs/tick" -H "Authorization: Bearer $JOBS_CRON_SECRET" -H "Content-Type: application/json" -d "{}"
```

## Pass criteria

- All three health endpoints return `status: ok` (or degraded with clear search detail, not 500)
- Public routes return 200
- Unauthorized jobs tick is not 200
- Authorized tick returns `ok: true` and writes `system_job_runs`
