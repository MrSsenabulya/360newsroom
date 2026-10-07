# AGENTS.md — Campus 360 Agent Instructions

This file applies to Cursor and any coding agent working in this repository.

## Prime directive

Build Campus 360 as a **credible youth-first campus media and information network**, not as a streaming clone, generic news template, university portal, or feature-heavy social platform.

Read all root Markdown files before making architecture or product decisions.

## Source of truth

When files conflict, use this order:

1. `product-requirements.md` — V1 scope.
2. `architecture.md` — system boundaries.
3. `data-model.md` — domain structure.
4. `newsroom-cms.md` / `control-room.md` — internal workflows.
5. `information-architecture.md` — navigation/discovery.
6. `design-system.md` — UI/UX rules.
7. `engineering-standards.md` — code quality.
8. `open-decisions.md` — intentionally unresolved choices.

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
- Domain access goes through typed services or Payload APIs/local API.
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
