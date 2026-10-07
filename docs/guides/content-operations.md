# Campus 360 — Content operations guide

How to create, edit, publish and manage content across **Public Web**, **Newsroom** and **360 Control**.

This guide matches the current V1 apps (`apps/web`, `apps/newsroom`, `apps/control`) on Supabase + Prisma (ADR 0001). Where older Guide docs mention Payload Admin, map those workflows here instead.

---

## 1. Apps and hierarchy (product truth)

| App | URL (local) | Audience | Purpose |
|-----|-------------|----------|---------|
| **Public Web** | http://localhost:3000 | Anyone (no login) | Read news, Watch, Opportunities, Events, Guide |
| **Newsroom** | http://localhost:3001 | Editorial staff | **Editorial CMS** — create, edit, archive/delete all public content |
| **360 Control** | http://localhost:3002 | Platform / commercial / admins | Users & rights, site health, commercial ops, **operator-facing error detail** |

```
Newsroom ──publishes──▶ Public Web
Control  ──rights / health / errors──▶ Newsroom + observes Public Web
```

**Rules**

- Journalism and Watch programmes are edited in **Newsroom**, never in Control.  
- Commercial users may track editorial *deliverables* in Control; they must not edit journalism.  
- End users (public and most Newsroom screens) see **friendly** error copy only. Raw codes and stack detail live in **Control → Health → Recent errors**.

---

## 2. Dev accounts (local)

Create Auth users + profiles (once per environment):

```bash
node packages/db/scripts/create-dev-users.mjs
```

| Role | Email | Password |
|------|--------|----------|
| EDITOR | `editor@campus360.test` | `Campus360!Editor` |
| CAMPUS_CORRESPONDENT | `correspondent@campus360.test` | `Campus360!Field` |
| COMMERCIAL_MANAGER | `commercial@campus360.test` | `Campus360!Commerce` |
| PLATFORM_ADMIN | `platform@campus360.test` | `Campus360!Platform` |

- Newsroom: sign in at `/login` on port **3001**.
- Control: sign in at `/login` on port **3002** (only roles allowed into Control).

---

## 3. Demo / seed data

Populate interesting demonstration content (articles, breaking, programmes, episodes with placeholder YouTube URLs, opportunities, events, vendors, media placeholders):

```bash
npm run db:seed
```

What you get (idempotent upserts):

- Campuses: Makerere + Kyambogo  
- ~9 published articles with hero placeholders (`/placeholders/*.svg` on Public Web)  
- Breaking updates (including a banner-enabled guild story)  
- Programmes **360 Hotseat** + **Campus Field Notes** with demo YouTube episode URLs  
- Opportunities, events (with posters), Campus Guide vendor  
- Commercial sponsor / campaign / lead for Control  

**Placeholders:** Seed `MediaAsset.publicUrl` values point at Public Web paths such as `/placeholders/story.svg`. Open **port 3000** to see images. Episode `videoUrl` fields use public YouTube samples as stand-ins for unlisted uploads — replace with real unlisted URLs before production.

---

## 4. Newsroom Editorial CMS

### 4.0 Hub and navigation

| Route | Purpose |
|-------|---------|
| `/` | **My Desk** — counts, urgent breaking, recent articles, quick actions |
| `/editorial` | **Editorial hub** — CMS overview with collection counts and New… actions |

Primary nav includes **Editorial**, Articles, Breaking, Opportunities, Events, Guide, Programmes (capability-gated where needed).

**Capabilities unchanged:** reporters / correspondents still cannot publish; only roles with `editorial.publish` / `breaking.review` (etc.) publish.

### Rich text and media (all long-form collections)

- **TipTap** editor in Newsroom for article body and long descriptions / programme **Synopsis** (stored as sanitized HTML in existing Prisma `String` fields — no JSON document schema in V1).  
- **Sanitize** on write (server) and again on public render (`.c360-prose` / `ProseHtml` via `sanitize-html`, no jsdom). Allowlist: headings, bold/italic, lists, links, images, blockquotes; YouTube appears as links in body (episode playback stays the dedicated player).  
- **Images:** upload via Newsroom `POST /api/media/upload` → `@campus360/storage` → `MediaAsset`, or paste a public URL as fallback (`MediaUrlField`).  
- **Video:** YouTube only (ADR / `@campus360/video`). No raw video file upload.  
- **Archive vs delete:** unpublished/draft → **hard delete**; published/scheduled/active → **archive/unpublish** (preserve history). Confirm dialogs on list and edit pages.

Requires Supabase Storage configured (`SUPABASE_URL`, service role, bucket e.g. `media`) for uploads; URL paste works without Storage.

### 4.1 Articles (standard journalism)

1. **Articles** → **New article** (`/articles/new`), or **New Article** from desk / Editorial hub.  
2. Fill **Title**, optional **Standfirst**, **Body** (TipTap), optional **hero** (upload or URL), campus, university, editorial risk.  
3. Creates a **DRAFT** → opens **Edit** (`/articles/[id]`).  
4. On **Edit**: TipTap body, hero MediaUrlField, workflow actions.  
5. On list: **Edit**, **Submit**, **Publish** (capability-gated), **Delete** / **Archive** (confirm).

**Public:** `/news/[slug]` renders body as sanitized HTML (`.c360-prose`).

### 4.2 Breaking (fast lane)

1. **Submit Breaking** (`/breaking/new`) — headline, short update (plain text), when it happened, campus, public source context.  
2. **Breaking** desk → **Edit** (`/breaking/[id]`): update headline/shortUpdate/banner flags; timeline append; **Delete** / **Archive**.  
3. Reviewers verify then publish when verification allows. Keep **banner** for true urgents only.

**Public:** `/breaking/[slug]`, optional site banner. Headline and `shortUpdate` stay **plain text** (not TipTap).

### 4.3 Review queue

Editors with `editorial.review` open **Review** (`/review`): articles in review states; request changes, advance, schedule, or publish per capabilities.

### 4.4 Opportunities

**Opportunities** (`/opportunities`): create with TipTap **description**; list **Edit** / **Publish** / **Archive|Delete**.  
**Edit** (`/opportunities/[id]`): full field update + TipTap description + archive/delete.

**Public:** `/opportunities`, `/opportunities/[slug]` (description as prose HTML). Expired listings leave discovery but keep direct URLs.

### 4.5 Events

**Events** (`/events`): create with TipTap description; list **Edit** / **Publish** / **Archive|Delete**.  
**Edit** (`/events/[id]`): TipTap description, **poster** upload/URL, lifecycle fields.

**Public:** `/events`, `/events/[slug]` (prose HTML + poster).

### 4.6 Campus Guide (vendors)

**Guide** (`/guide`): create listing with TipTap description; list **Edit** / **Archive|Delete**.  
**Edit** (`/guide/[id]`): TipTap description, **logo** upload/URL, verified/featured as policy allows. Control can also approve vendors (§5).

**Public:** `/guide`, `/guide/[slug]` (prose HTML). No checkout in V1.

### 4.7 Programmes & episodes (Watch)

**Programmes** (`/programmes`) — `programme.manage`.

1. Create programme: name, **Synopsis** (TipTap → `Programme.description`), type, status, cover upload/URL.  
2. **Edit** (`/programmes/[slug]`): synopsis, cover, programme **Archive|Delete**; add/edit **episodes** with synopsis TipTap, YouTube URL, thumb upload/URL, optional transcript, publish checkbox.  
3. Archive episodes / programmes to remove from public Watch while keeping records.

**Public:** `/watch`, programme and episode pages — synopsis as prose HTML; episode video via YouTube embed.

### 4.8 Tips & jobs

- **Tips** — reader tips inbox.  
- **Jobs** — temporal job visibility / retry for privileged roles.

---

## 5. 360 Control — commercial and platform

Open **Overview** (`/`) for the Control dashboard (editorial health, campaigns, leads, vendors, jobs, audit).

### 5.1 Interaction model

**Observe → anomaly → drill-down → action.** Do not rebuild Newsroom editing inside Control.

### 5.2 Sponsors & campaigns

Requires `campaign.manage`:

1. **Sponsors** — organisation commercial record, contacts, status.  
2. **Campaigns** — objectives, dates, campuses, **deliverables** (due dates, status).  
3. Chase **overdue deliverables** from the dashboard Attention panel.  

Commercial staff track whether editorial promised a homepage feature or Guide listing — they do **not** rewrite the article.

### 5.3 Leads

**Leads** — inbound commercial interest (status pipeline: new → contacted → qualified → …).

### 5.4 Vendors

**Vendors** — approve / manage Campus Guide listings (`vendor.approve`). Pending count appears on the dashboard.

### 5.5 Editorial health

**Editorial** — read-only operational view (workflow counts, scheduled, breaking). Deep-link editors into Newsroom for fixes.

### 5.6 People & access

**People** (`users.manage`) — roles, campus scopes, activation.

- Deactivation must revoke sessions while preserving authorship history.  
- Privileged internal roles should use MFA in production.

### 5.7 Health, jobs, audit, errors

- **Health** — platform status (Postgres, Search), **Recent errors** (`operational_events`), recent jobs.  
- **Jobs** — failed/retryable system jobs (including cron tick with `JOBS_CRON_SECRET`). Job failures are also reported into operational events.  
- **Audit** — privileged mutation trail.

**Error philosophy:** Public Web / Newsroom / Control user-facing `error.tsx` pages show short friendly copy only (no stacks or internal codes). Operators open **Health** for severity, surface, message, detail, path and time. Dashboard **Attention** links here when recent error counts are above zero.

---

## 6. Media: images and video

### 6.1 Images

| Use | Field | Notes |
|-----|--------|------|
| Article hero | `Article.heroMediaId` → `MediaAsset` | Upload or URL in Newsroom |
| In-body images | HTML `<img>` in sanitized body | TipTap insert image (upload or URL) |
| Programme cover | `Programme.coverId` | Watch tiles |
| Episode thumb | `Episode.thumbnailId` | Watch tiles / fallback |
| Event poster | `Event.posterId` | Event detail |
| Vendor logo | `Vendor.logoId` | Guide detail |

`MediaAsset` stores `publicUrl`, `altText`, `credit`, `rights`. Prefer `@campus360/storage` (Supabase Storage bucket **`images`**) so URLs are durable.

Create / update the bucket once per environment:

```bash
node packages/storage/scripts/ensure-images-bucket.mjs
```

Bucket is **public**, **images only** (JPEG/PNG/WebP/GIF), max **5MB**. Override name with `SUPABASE_STORAGE_BUCKET` if needed.

**Demo placeholders:** SVG files under `apps/web/public/placeholders/`.

### 6.2 Video

V1 playback is **unlisted YouTube** via `Episode.videoUrl`:

1. Upload to YouTube as **Unlisted**.  
2. Paste the watch URL into Newsroom episode form.  
3. Public episode page embeds via privacy-friendly YouTube host.

In-body video in TipTap is insert-as-YouTube-link only — not raw file upload.

---

## 7. Publishing checklist (editorial)

Before publish:

1. Facts verified; risk level correct.  
2. Campus / university / topics set.  
3. No private sources or commercial notes in public body.  
4. Breaking: timeline accurate; banner only if warranted.  
5. Opportunity deadlines / Event times correct.  
6. After publish, spot-check Public Web (home, slug URL, search).

---

## 8. Editing existing content

| Content | Where to edit | Notes |
|---------|---------------|--------|
| Article | `/articles/[id]` | TipTap body; archive published; hard-delete drafts |
| Breaking | `/breaking/[id]` | Plain headline/shortUpdate; archive/delete |
| Opportunity | `/opportunities/[id]` | TipTap description |
| Event | `/events/[id]` | TipTap + poster |
| Guide | `/guide/[id]` | TipTap + logo |
| Programme / Episode | `/programmes/[slug]` | Synopsis TipTap; YouTube + thumb |
| Sponsor / Campaign / Lead | Control | Commercial only |
| Vendor approval | Control → Vendors and/or Newsroom Guide | Capability gated |
| User roles | Control → People | Least privilege |
| Error detail | Control → Health | Never on public UI |

**Archive vs delete:** Unpublished drafts are removed. Published/scheduled/active items are archived off the public site so authorship and history remain.

**Slug caution:** Changing slugs breaks shared links and SEO. Prefer redirects if a slug must change.

---

## 9. Local commands cheat sheet

```bash
# Install
npm install

# Env: root .env + apps/*/.env.local (Supabase Postgres URLs)

# Generate Prisma client (stop Next on Windows if EPERM)
npm run db:generate

# Migrate + seed demo content
npm run db:migrate
npm run db:seed

# Dev Auth users
node packages/db/scripts/create-dev-users.mjs

# Run apps (separate terminals)
npm run dev -w @campus360/web        # :3000
npm run dev -w @campus360/newsroom   # :3001
npm run dev -w @campus360/control    # :3002
```

---

## 10. Security reminders

- Authorization is **server-side** (capabilities in `@campus360/domain`). UI hiding is not access control.  
- Sensitive source notes never appear in public APIs, Search, analytics, or client bundles.  
- Validate all writes; audit privileged mutations.  
- No secrets in source or admin responses.

---

## 11. Related docs

- `AGENTS.md` — product and engineering constraints  
- `Guide/newsroom-cms.md` — editorial workflow intent (map Payload → Newsroom)  
- `Guide/control-room.md` — Control interaction model  
- `docs/adr/0001-supabase-prisma.md` — backend foundation  
- `docs/launch/` — production go-live and smoke checks  

---

*Last updated for the Newsroom Editorial CMS pass: TipTap + sanitized HTML, media upload, full CRUD for Breaking/Opportunities/Events/Guide/Programmes, `/editorial` hub.*
