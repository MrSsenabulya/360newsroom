# ADR-001 — Supabase + Prisma + Payload hybrid backend

## Status
Accepted

## Date
2026-09-07

## Context

The Campus 360 handoff pack specifies Payload CMS as the Newsroom/CMS foundation and PostgreSQL as the primary database. The product owner requested Supabase and Prisma for the backend.

Using Prisma as a full replacement for Payload would abandon the documented Newsroom operating system (workflows, versions, admin UX, access control patterns). Using Payload alone would ignore the request for Prisma and Supabase-managed infrastructure.

## Decision

Adopt a **hybrid**:

1. **Supabase** — managed PostgreSQL (primary `DATABASE_URL`), and S3-compatible **Storage** for media/objects in later milestones. Auth may be evaluated later for Control; Newsroom auth remains Payload-owned in V1.
2. **Payload CMS** — Newsroom collections, editorial workflows, media metadata, versions, jobs hooks, and internal admin UI.
3. **Prisma** — typed access for **360 Control** and **platform/system tables** that are not CMS documents (health checks, job run records, audit projections, commercial ops tables as they land).

Schema ownership:

- Payload owns CMS/editorial tables via its Postgres adapter and migrations.
- Prisma owns platform/control tables under a clear prefix/schema (`platform_*` / `control` schema) so the two ORMs do not fight over the same tables.
- Public Web reads published content through typed serializers / Payload Local or REST API — never raw Payload docs in the client.

## Alternatives considered

### Alternative A — Prisma + Supabase only (no Payload)
Pros:
- Single ORM mental model.
- Aligns literally with “Supabase and Prisma for the backend.”

Cons:
- Rebuilds Newsroom admin, drafts/versions, and workflow UX from scratch.
- Contradicts handoff non-negotiables and delays the Breaking Fast Lane success condition.

### Alternative B — Payload + Supabase Postgres only (no Prisma)
Pros:
- Closest to the written architecture.
- One migration story for content.

Cons:
- Control/platform code lacks a first-class typed query layer preferred by the team.

### Alternative C — Dual-write same tables with Payload and Prisma
Pros:
- Convenient queries everywhere.

Cons:
- High migration conflict risk; rejected.

## Consequences

Positive:
- Preserves Newsroom on Payload.
- Uses Supabase for durable Postgres/Storage without locking unresolved Search/Video providers.
- Gives Control a Prisma-shaped backend from Milestone 0.

Negative / trade-offs:
- Two migration pipelines (Payload + Prisma) must be documented and run in CI/dev.
- Developers must know which layer owns which tables.
- Prisma must not introspect/overwrite Payload-managed tables as source of truth.

## Product impact

- Public Web: unchanged — Next.js consuming published DTOs.
- Newsroom: Payload Admin.
- 360 Control: Next.js + Prisma against platform tables; deep-links into Payload for editorial.
- Data model: CMS entities in Payload; platform entities in Prisma.
- Operations: Supabase project hosts Postgres (+ Storage later).

## Migration/rollout

Milestone 0:
- Wire `DATABASE_URL` (Supabase Postgres) into Payload and Prisma.
- Ship Prisma `HealthCheck` / foundation tables.
- Ship Payload Users + minimal config.
- Document env vars and dual-migrate scripts.

Later milestones:
- Add `@payloadcms/storage-s3` (or Supabase S3-compatible endpoint) behind Media.
- Keep Search/Video as adapters (open decisions).

## Reversal cost

Medium. Dropping Prisma later is easy (Control rewrites). Dropping Payload later is expensive once editorial content exists. Swapping Supabase Postgres for another Postgres host is low cost if URLs/secrets stay adapter-shaped.

## References

- `Guide/architecture.md`
- `Guide/open-decisions.md`
- `Guide/implementation-plan.md` (Milestone 0)
- `Guide/AGENTS.md` (do not silently override documented decisions)
