# Campus 360 — Cursor Handoff Pack

This folder is the working product, UX, architecture, content, engineering and implementation brief for **Campus 360**.

Campus 360 is not being built as an "online TV website", a Netflix clone, a YouTube clone, a generic African news portal, or a university information portal. It is being built as a **youth-first campus media and information network**: the digital home of campus life.

> **If it matters on campus, Campus 360 should know about it.**

The public product should help students:
- know what is happening;
- understand breaking campus developments;
- find relevant opportunities;
- discover events;
- watch original Campus 360 programmes;
- search campus information;
- find useful campus-adjacent services;
- understand the culture, people and conversations shaping university life.

The internal platform has three distinct products:

1. **Campus360.com** — public, mobile-first student experience.
2. **Campus 360 Newsroom** — Payload CMS-based editorial operating system.
3. **360 Control** — management, commercial and platform operations interface.

## Read in this order

1. `context.md`
2. `user-journeys.md`
3. `information-architecture.md`
4. `data-model.md`
5. `architecture.md`
6. `newsroom-cms.md`
7. `control-room.md`
8. `product-requirements.md`
9. `design-system.md`
10. `wireframes-and-interactions.md`
11. `content-governance.md`
12. `engineering-standards.md`
13. `testing-qa.md`
14. `implementation-plan.md`
15. `open-decisions.md`
16. `cursor-prompt.md`

Also read `AGENTS.md` and `.cursor/rules/`.

## Non-negotiable product principles

- Mobile first.
- Information before spectacle.
- No mandatory account for V1.
- Campus context is persistent but non-exclusive.
- Breaking Updates are separate from full Articles.
- Opportunities and Events are first-class structured entities.
- Video is important, but the product is not video-first.
- Search is a core product, not a utility afterthought.
- Vendors are exposed publicly as **Campus Guide**, not as a marketplace.
- Commercial content is clearly disclosed.
- Newsroom and 360 Control are separate experiences.
- Payload CMS is the CMS/backend foundation.
- PostgreSQL is the primary relational database.
- Do not over-customize Payload before workflow friction is observed.
- Do not build features listed as Not V1 unless explicitly requested.
- Do not introduce generic "AI SaaS" visual patterns.
- Accessibility and performance are launch requirements.

## What Cursor should do first

Before writing features:

1. Read this handoff pack.
2. Summarize the architecture and V1 scope.
3. Identify contradictions or missing implementation decisions.
4. Propose the repository scaffold.
5. Wait for scaffold approval.
6. Implement milestone-by-milestone from `implementation-plan.md`.
7. Document architecture changes.

Do not attempt to generate the entire product in one pass.
