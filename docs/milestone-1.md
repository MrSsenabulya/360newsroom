# Milestone 1 — Content Core

## Implemented

### Data
- Expanded Prisma schema: geography, topics, people, organisations, media assets, articles, breaking (+ timeline), programmes, episodes
- Public-safe serializers in `@campus360/content` (no private source contacts)
- Editorial helpers: create/publish article & breaking, append timeline
- Seed: Uganda → Makerere → sample Article, Breaking, Hotseat episode

### Public (`apps/web`)
- Home with Breaking banner + lead story + Latest + Watch tease
- `/latest`, `/news/[slug]`, `/breaking/[slug]`
- `/campus`, `/campus/[slug]`
- `/watch`, `/watch/programmes/[slug]`, `/watch/programmes/[slug]/[episode]`

### Newsroom (`apps/newsroom`)
- Desk overview
- Articles list + new draft + publish
- Breaking list + mobile-friendly submit + verify/publish + timeline append
- Programmes list (seeded)

## Apply locally

```bash
npm install
npm run db:generate
npm run db:push          # against Supabase
npm run db:seed
npm run dev
```

Public content needs no login. Newsroom needs a Supabase Auth user (profile auto-created on first login).

## Exit criteria

- Editor can publish Article / Breaking from Newsroom
- Student can open `/news/...` and `/breaking/...` without login
- Campus hub and Programme/Episode pages render seeded content

## Deferred to Milestone 2+

- Full role capability enforcement on publish
- Review Queue / Changes Requested workflow UI
- Formal Corrections
- Rich media upload UI
- Search indexing
