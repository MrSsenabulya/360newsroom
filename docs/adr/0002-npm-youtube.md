# ADR 0002 — npm workspaces + YouTube video starter

- Status: Accepted
- Date: 2026-09-07

## Context

Milestone 0 used pnpm. The project owner prefers **npm** for package management.

Video processing provider is still open (`Guide/open-decisions.md`). For starters, playback will use an **unlisted YouTube channel**.

## Decision

1. Monorepo package manager is **npm workspaces** (`package.json#workspaces`).
2. Internal packages use `"*"` version references (not `workspace:*`).
3. `@campus360/video` exposes a `VideoAdapter`; default implementation is YouTube (watch URL / ID → privacy-enhanced embed).
4. Episode `videoUrl` stores a YouTube watch URL or video ID. Dedicated streaming can replace the adapter later.

## Consequences

- Use `npm install`, `npm run dev`, `npm run db:push`, etc.
- Unlisted YouTube is fine for MVP distribution; not a long-term African CDN / rights / analytics strategy.
- Do not autoplay with sound.
