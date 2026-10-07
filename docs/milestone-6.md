# Milestone 6 — Launch Hardening

## Implemented

### Security
- Shared `withSecurityHeaders` on web / newsroom / control (CSP, frame deny, nosniff, referrer, permissions)
- `poweredByHeader: false`
- In-memory rate limits on `/advertise` and `/tip` (hash IP; swap to Redis for multi-instance)
- `StoryTip` model for moderated tips (not auto-published)

### Accessibility / UX
- Skip-to-content link on `AppShell`
- `main` landmark + focus target
- Root `loading.tsx` for public web
- Governance footer links

### Governance pages (P0 launch set)
- `/privacy` `/terms` `/editorial-standards` `/corrections` `/advertising-policy` `/contact` `/tip`

### Tests (CI)
- Domain capability tests (journalist cannot publish; commercial separation)
- Serializer leakage smoke tests
- Rate-limit unit test
- `npm test` added to CI workflow

### Launch ops docs (`docs/launch/`)
- Readiness checklist
- Backups / restore
- Incident response
- Drills + drill log
- Content migration
- Newsroom training
- Monitoring

## Still human / hosting-dependent
- Enable Supabase PITR and MFA for privileged roles in the dashboard
- Wire production cron for jobs tick
- Real device lab pass + Lighthouse on staging URLs
- Fill drill log after rehearsals

## Exit

Launch blockers are documented and testable; ops runbooks exist; public write endpoints are rate-limited; CI runs automated authz/leak smoke tests.

## After launch

Treat East Africa-wide expansion and marketplace features as out of V1 (see Guide).
