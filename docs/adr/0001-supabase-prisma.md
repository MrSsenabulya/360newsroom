# ADR 0001 — Supabase + Prisma instead of Payload as CMS foundation

- Status: Accepted
- Date: 2026-09-07
- Deciders: Product owner + implementation

## Context

The Campus 360 handoff pack (`Guide/`) specifies Payload CMS + PostgreSQL as the
CMS/backend foundation, with Next.js public and Control apps.

The project owner directed Milestone 0 to use **Supabase** and **Prisma** for the backend.

Payload 3 manages schema through its own Postgres/Drizzle layer. Running Payload and Prisma
as dual owners of the same schema is an anti-pattern (conflicting migrations, unclear source of truth).

## Decision

For Milestone 0 and forward unless reversed:

1. **Supabase** provides hosted Postgres, Auth (internal users), and Storage.
2. **Prisma** owns application schema and migrations in `packages/db`.
3. **Newsroom** is a dedicated Next.js app (`apps/newsroom`) with custom editorial UI, not Payload Admin.
4. Adapter boundaries remain for Search, Video, Analytics, and Storage (Storage adapter uses Supabase).

## Consequences

- Positive: one ORM, familiar stack, Supabase Auth/Storage without glue.
- Positive: Newsroom UX can be purpose-built for Breaking Fast Lane and mobile correspondents.
- Negative: loses Payload Admin, versions, and field APIs out of the box — rebuild editorial
  primitives (drafts, versions, upload UI, access hooks) in-app.
- Negative: diverges from handoff docs; agents must treat this ADR as overriding Payload-as-foundation.

## Follow-ups

- Revisit Payload only if editorial tooling cost exceeds custom Newsroom build.
- Keep `Guide/newsroom-cms.md` workflows as product requirements; implement them on Prisma models.
- Document public DTO serializers before any client exposure of editorial tables.
