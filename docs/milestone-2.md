# Milestone 2 — Newsroom

## Implemented

### Access control
- Expanded capabilities in `@campus360/domain`
- Server-side `assertCapability` / campus scope checks in `@campus360/content/editorial`
- New profiles default to **JOURNALIST** (cannot publish)
- Correspondents/journalists limited to assigned campuses (+ own work)

### Workflow
- Article transitions: Draft → In Review → Changes Requested / Verification → Ready → Scheduled / Published
- Version snapshots on create/transition (`article_versions`)
- `EditorialActivity` + `AuditEvent` on privileged mutations
- High-risk (`editorialRisk=HIGH`) publish requires `editorial.escalate` (EIC)
- Schedule + “Publish due scheduled”

### Breaking Fast Lane
- Mobile-oriented submit form (headline, update, when, campus, public source context)
- Submitters cannot publish; editors verify & publish
- Timeline append with ownership/review checks

### Sources
- `sources` table with private identity/notes (never in public serializers)
- Add/list from Review Queue (internal only)

### Newsroom UI
- Desk shows role, queue counts, urgent breaking
- Articles: submit for review / publish (capability-gated)
- `/review` Review Queue
- Breaking desk respects publish capability

## Apply

```bash
npm run db:push
npm run db:generate
npm run dev
```

Promote a user to editor in Supabase SQL / Prisma Studio:

```sql
update user_profiles set role = 'EDITOR' where email = 'you@example.com';
-- correspondents need campus_scopes rows
```

## Exit criteria

- Correspondent submits Breaking → editor publishes → reporter cannot bypass
- Article review path works (submit → review → ready → publish/schedule)
- Scheduling supported; high-risk gated to EIC
