# Campus 360

Youth-first campus media and information network.

> If it matters on campus, Campus 360 should know about it.

## Surfaces

| App | Port | Purpose |
| --- | --- | --- |
| `apps/web` | 3000 | Public Campus360.com |
| `apps/newsroom` | 3001 | Editorial operating system |
| `apps/control` | 3002 | Management / platform ops |

## Stack (Milestone 0+)

- Next.js 15 + TypeScript strict
- Supabase (Auth, Storage, hosted Postgres)
- Prisma (schema + migrations)
- npm workspaces + Turborepo
- YouTube (unlisted) via `@campus360/video` adapter for starter playback

See [docs/adr/0001-supabase-prisma.md](docs/adr/0001-supabase-prisma.md) and [docs/adr/0002-npm-youtube.md](docs/adr/0002-npm-youtube.md).

## Quick start

1. Fill `.env` at the repo root with real Supabase **Database** URLs and **API** keys (not placeholders).
2. Copy into apps:

```bash
copy .env apps\web\.env.local
copy .env apps\newsroom\.env.local
copy .env apps\control\.env.local
```

3. Install and sync schema:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

- Public: http://localhost:3000
- Newsroom: http://localhost:3001/login
- Control: http://localhost:3002/login
- Health: `/api/health` on each app

## Brand

Logo assets live in `assets/` and are copied into each app’s `public/brand/`.
Design tokens derive from the logo coral→magenta→purple gradient on a light paper surface
(`packages/ui`).

## Product docs

The full handoff pack is in [`Guide/`](Guide/). Start with `Guide/README.md` and `Guide/AGENTS.md`.

## Milestone 0 exit

- [x] Monorepo scaffold
- [x] Three app shells
- [x] Prisma + Postgres
- [x] Supabase Auth login on Newsroom + Control
- [x] Design tokens / primitives
- [x] Health endpoints
- [x] Object storage adapter (Supabase Storage)
- [x] ADR for backend choice

## Milestone 1

See [docs/milestone-1.md](docs/milestone-1.md). Content core schema, public Article/Breaking/Campus/Watch pages, and Newsroom publish flows.
## Milestone 2

See [docs/milestone-2.md](docs/milestone-2.md). Capabilities, campus scoping, Review Queue, Breaking Fast Lane guards, sources, versions, scheduling.

## Milestone 3

See [docs/milestone-3.md](docs/milestone-3.md). Public chrome (nav + campus preference), Search, sharing, SEO metadata, sitemap/robots.

## Milestone 4

See [docs/milestone-4.md](docs/milestone-4.md). Opportunities, Events, Campus Guide, topic hubs, temporal jobs tick.

## Milestone 5

See [docs/milestone-5.md](docs/milestone-5.md). 360 Control: sponsors, campaigns, deliverables, leads, people/access, health, jobs, audit.

## Milestone 6

See [docs/milestone-6.md](docs/milestone-6.md). Launch hardening: security headers, rate limits, governance pages, tests, and ops runbooks in `docs/launch/`.

## Production go-live (post-M6)

See [docs/adr/0003-production-deployment.md](docs/adr/0003-production-deployment.md) and [docs/launch/production-golive.md](docs/launch/production-golive.md). Control exposes `POST /api/jobs/tick` (Bearer `JOBS_CRON_SECRET`); GitHub Actions runs it every 10 minutes.

# 360newsroom
