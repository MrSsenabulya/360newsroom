# Launch readiness checklist

Use before production cutover. Do not launch if any **blocker** fails.

## Blockers (must pass)

- [ ] Breaking publish path works; banner can expire via jobs tick
- [ ] Journalist/correspondent cannot publish Articles (capability test + manual)
- [ ] Search finds Article, Campus, Opportunity, Event, Guide listing
- [ ] Search failure degrades without taking down Home
- [ ] Expired Opportunity removed from `/opportunities` but direct URL shows Applications closed
- [ ] Private source fields / contract values absent from public HTML and `/api` public DTOs
- [ ] Scheduled Articles publish via Jobs tick (or fail visibly in Control/Newsroom Jobs)
- [ ] Supabase backup/PITR enabled; restore drill documented
- [ ] MFA required for privileged production roles (see backups-restore.md)
- [ ] `JOBS_CRON_SECRET` set; GitHub Actions cron workflow green once via `workflow_dispatch`
- [ ] Health endpoints green: web/newsroom/control `/api/health`
- [ ] Staging smoke script passed ([staging-smoke.md](staging-smoke.md) / `npm run smoke:staging`)
- [ ] Skip link + keyboard focus work on public shell
- [ ] Governance pages live: Privacy, Terms, Editorial Standards, Corrections, Advertising, Contact, Tip
- [ ] Campus hubs not empty for pilot campus

## Performance (target)

- [ ] LCP ≤ 2.5s on mid-range Android for Home + Article on 4G
- [ ] No autoplay-with-sound
- [ ] Core routes server-rendered; below-fold media lazy

## Security

- [ ] HTTPS only in production
- [ ] Security headers present (CSP, frame deny, nosniff)
- [ ] Secrets only in env / secret manager
- [ ] MFA enabled for SUPER_ADMIN / PLATFORM_ADMIN / EIC in Supabase
- [ ] Rate limits on `/advertise` and `/tip`
- [ ] Deactivated users cannot sign in

## Devices / browsers

- [ ] Public: latest Chrome Android, Safari iOS, Chrome desktop
- [ ] Newsroom field flow on phone width
- [ ] Control usable at desktop 1280px+

## Sign-off

| Role | Name | Date |
|------|------|------|
| Product | | |
| Editorial (EIC) | | |
| Platform | | |
| Commercial | | |
