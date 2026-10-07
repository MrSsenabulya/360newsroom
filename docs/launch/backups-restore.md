# Backups & restore (Supabase)

## Policy

- Production Postgres: enable **Point-in-Time Recovery** (or daily backups minimum) in Supabase.
- Storage buckets: versioning / lifecycle per environment.
- Auth: treat Supabase Auth as system of record; do not delete profiles when deactivating.
- Privileged staff: require MFA (AAL2) for SUPER_ADMIN, PLATFORM_ADMIN, EDITOR_IN_CHIEF, and COMMERCIAL_MANAGER before production cutover.

## MFA (Supabase)

1. Auth → Providers / Multi-Factor: enable TOTP (and phone if required by policy).
2. Require enrolled MFA for privileged users before granting production access.
3. Document recovery codes with the Platform Admin; store offline, not in git.
4. Deactivation still revokes sessions (existing app rule).

## Weekly check

1. Confirm backup / PITR status in Supabase Dashboard → Database.
2. Confirm `DIRECT_URL` available for restore ops (not pooler-only).
3. Record last successful backup timestamp in the incident channel.

## Restore drill (staging)

1. Create a staging project or branch database.
2. Restore from backup / PITR to a known timestamp.
3. Run `npm run db:generate` and verify schema matches `packages/db/prisma/schema.prisma`.
4. Smoke: Home, login Newsroom, Control overview, Search.
5. Log duration and gaps in `docs/launch/drill-log.md`.

## Secrets

Never commit `.env`. Rotate `SUPABASE_SERVICE_ROLE_KEY` if exposed. Prefer separate projects for staging/production.
