# AGENTS.md — Campus 360 Agent Instructions

This file applies to Cursor and any coding agent working in this repository.

## Prime directive

Build Campus 360 as a **credible youth-first campus media and information network**, not as a streaming clone, generic news template, university portal, or feature-heavy social platform.

Read `Guide/` Markdown files and `docs/adr/` before making architecture or product decisions.

## Stack override (ADR 0001 / 0002)

Backend foundation is **Supabase + Prisma**, not Payload CMS.
Package manager is **npm workspaces** (not pnpm).
Starter video playback is **unlisted YouTube** via `@campus360/video`.

- Schema/migrations: `packages/db` (Prisma)
- Internal auth: Supabase Auth
- Object storage: Supabase Storage via `@campus360/storage`
- Video: YouTube adapter (`@campus360/video`) until a dedicated provider is chosen
- Apps: `apps/web`, `apps/newsroom`, `apps/control`

When `Guide/` mentions Payload, map requirements to Prisma models + Newsroom/Control Next apps unless a new ADR reverses this.

## Source of truth

When files conflict, use this order:

1. `docs/adr/*` — accepted architecture overrides
2. `Guide/product-requirements.md` — V1 scope
3. `Guide/architecture.md` — system boundaries (except Payload specifics superseded by ADR 0001)
4. `Guide/data-model.md` — domain structure
5. `Guide/newsroom-cms.md` / `Guide/control-room.md` — internal workflows
6. `Guide/information-architecture.md` — navigation/discovery
7. `Guide/design-system.md` — UI/UX rules (brand colors: logo-derived coral/magenta; light public paper)
8. `Guide/engineering-standards.md` — code quality
9. `Guide/open-decisions.md` — intentionally unresolved choices

Do not silently override a documented decision. If a change is necessary, explain it and propose an ADR.

## Product constraints

- Anonymous users can read, watch, browse, search, view events/opportunities and use Campus Guide.
- Campus preference may persist locally without auth.
- Breaking publication must be faster/simpler than normal Article publishing.
- Reporters/correspondents cannot publish directly.
- High-risk editorial content escalates.
- Commercial users may track editorial deliverables but may not edit journalism.
- Expired Opportunities remain viewable by direct URL but are removed from active listings.
- Ended Events persist and may surface recaps/coverage.
- Search indexes multiple entity types.
- No public comments in V1.
- No native apps in V1.
- No marketplace checkout in V1.
- No AI-generated journalism.
- No algorithmic TikTok-style feed in V1.

## Engineering constraints

- TypeScript strict.
- Server-side authorization is mandatory.
- Sensitive source notes never appear in public APIs/search/analytics/client bundles.
- Prefer server rendering for editorial content.
- Avoid unnecessary client JavaScript.
- No direct database access from UI components.
- Domain access goes through typed services or Prisma repositories.
- Validate all writes on the server.
- Significant privileged mutations create audit events.
- Jobs/callbacks/imports should be idempotent where practical.
- Scheduled publishing failures must be visible and actionable.
- External services sit behind adapters.
- No secrets in source code or admin UI.

## UX constraints

- Public UX is mobile-first.
- Newsroom field reporting works well on phones.
- 360 Control is desktop-first but responsive.
- No autoplay video with sound.
- Do not block urgent information with ads/login/modals.
- Use cards only when containment helps.
- Prefer editorial grids, rules, typography and spacing over floating card walls.
- Core screens need loading/empty/error/relevant temporal states.
- Target WCAG 2.2 AA.
- Brand: coral→magenta→purple from `assets/`; light paper public surfaces.

## Before merging

Confirm:
- feature belongs to V1 or is explicitly approved;
- access control is enforced;
- loading/empty/error states exist;
- analytics are purposeful;
- mobile is tested where relevant;
- no private data leaks;
- tests fit feature risk;
- docs are updated.
