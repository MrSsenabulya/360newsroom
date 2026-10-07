# Milestone 0 — Foundation report

## Implemented

- pnpm + Turborepo monorepo
- Apps: `web` (:3000), `newsroom` (:3001), `control` (:3002)
- Packages: `config`, `domain`, `db` (Prisma), `auth` (Supabase), `ui`, `storage`
- Design tokens from logo coral→magenta→purple on light paper
- Brand assets under each app `public/brand/`
- Health endpoints at `/api/health`
- Newsroom + Control login via Supabase Auth
- Prisma schema: profiles, roles, geography stubs, campus scopes, audit, health checks
- Initial migration SQL
- ADR 0001 documenting Supabase + Prisma over Payload

## Migrations

- `packages/db/prisma/migrations/20260907120000_init`

Apply with Supabase Postgres URL or local Docker:

```bash
pnpm db:migrate
# or against existing DB:
pnpm --filter @campus360/db exec prisma migrate deploy
```

## Environment variables

See `.env.example`. Required for apps:

- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server)

## Access / security

- Public web has no mandatory auth
- Newsroom/Control require Supabase session
- Role capabilities live in `@campus360/domain` (enforcement expands in M1–M2)
- Service role key never exposed to client

## Tests

- Typecheck passes across packages/apps
- Production builds succeed for web, newsroom, control
- DB migrate not run in this environment (Docker unavailable); migration SQL committed

## Performance / accessibility notes

- Provisional Archivo + Source Serif 4 via `next/font`
- Semantic tokens and focus styles in `@campus360/ui`
- Full WCAG audit deferred to later milestones

## Known limitations

- No live Supabase project wired in this workspace yet
- Profile sync after Auth signup is manual SQL (`seed-profile.sql`)
- Editorial collections not yet modeled (Milestone 1)
- Search/Video adapters not yet stubbed beyond Storage

## Docs updated

- `README.md`, `AGENTS.md`, `docs/adr/0001-supabase-prisma.md`, `.cursor/rules`
