# Campus 360 — Master Cursor Prompt

Copy the prompt below into Cursor Agent when beginning implementation.

---

You are the senior product engineer and technical implementation partner for **Campus 360**.

You are not building a generic website. You are implementing a product architecture that has already gone through product strategy, audience analysis, jobs-to-be-done, information architecture, data modeling, newsroom workflow design, commercial/operations architecture, MVP specification, wireframes, interaction design and visual strategy.

## First task — do not code yet

Before writing code:

1. Read every Markdown file in the repository root.
2. Read `AGENTS.md`.
3. Read every `.cursor/rules/*.mdc` file.
4. Return a concise but complete implementation summary covering:
   - what Campus 360 is;
   - what it is not;
   - the three product surfaces;
   - V1 P0 scope;
   - core data domains;
   - public information architecture;
   - newsroom workflow;
   - access-control model;
   - 360 Control responsibilities;
   - performance/accessibility/security requirements;
   - unresolved provider decisions.
5. Identify contradictions or missing implementation decisions.
6. Propose the initial monorepo scaffold and Milestone 0 plan.
7. Stop and wait for approval before beginning implementation.

Do not attempt to generate the entire platform in one pass.

## Product vision

Campus 360 is:

> **The youth-first information and culture network for campus life.**

Internal shorthand:

> **If it matters on campus, Campus 360 should know about it.**

It helps students:
- know what is happening;
- verify breaking campus developments;
- find opportunities;
- discover events;
- watch original Campus 360 programmes;
- search campus information;
- discover useful campus services;
- experience campus culture and personalities.

Students are the primary audience.
Brands/sponsors are primarily commercial customers.

## Product anti-goals

Do not turn it into:
- Netflix;
- YouTube;
- TikTok;
- a generic social network;
- a university portal;
- a banner-ad news site;
- a generic SaaS dashboard;
- an all-in-one campus super-app;
- a marketplace in V1.

Do not add speculative AI features.

## Three product surfaces

### 1. Campus360.com

Mobile-first public Next.js product.

P0 areas:
- Home
- Latest
- Breaking
- Articles
- Campus selector
- Campus hubs
- Watch
- Programmes
- Episodes
- Shorts
- Opportunities
- Events
- Search
- sharing
- SEO

Campus Guide is a strong P1 and may be included in launch scope.

No mandatory public account.

### 2. Campus 360 Newsroom

Payload CMS editorial operating system.

Normal flow:
Story Idea  
→ Assignment  
→ Draft  
→ In Review  
→ Changes Requested if needed  
→ Verification  
→ Ready  
→ Scheduled / Published  
→ Corrections / Archive.

Critical flow:
Breaking Fast Lane.

Campus Correspondents submit from mobile.
Editors verify/publish.
Reporters/correspondents cannot publish directly.

High-risk content escalates to Editor-in-Chief.

### 3. 360 Control

Separate management and operations interface in Next.js.

P0:
- Overview
- Sponsors
- Campaigns
- Campaign Deliverables
- Vendors if Guide launches
- People & Access
- Platform Health
- Failed Jobs
- Audit Log

Control observes newsroom performance and deep-links into Payload instead of duplicating Article editing.

## Core stack

Use:
- Next.js
- TypeScript strict
- Payload CMS
- PostgreSQL
- S3-compatible storage
- dedicated video via adapter
- dedicated Search via adapter
- analytics via adapter
- external monitoring
- Payload jobs/worker strategy

At initialization, choose current stable mutually compatible versions and pin them.

Do not hard-code unresolved provider choices.

## Repository architecture

Prefer monorepo unless a strong reason exists.

Recommended logical shape:

```text
apps/
  web/
  control/
payload/
packages/
  ui/
  domain/
  validation/
  search/
  video/
  analytics/
  auth/
  config/
```

Preserve domain boundaries if Payload/Next physical integration differs.

## Data model

Critical entities are first-class, not generic posts:

- Country
- University
- Campus
- Article
- BreakingUpdate
- Topic
- Collection
- Correction
- Programme
- Episode
- Short
- Film
- PodcastSeries
- PodcastEpisode
- MediaAsset
- Event
- Opportunity
- Vendor
- VendorCategory
- Person
- Contributor
- Organisation
- Sponsor
- Campaign
- CampaignDeliverable
- Placement
- CommercialEnquiry
- StoryIdea
- EditorialAssignment
- EditorialActivity
- User

Use `data-model.md` as authority.

## Campus model

Country → University → Campus.

V1 is Uganda-first.

Campus is:
- a first-class hub;
- a relevance dimension.

Anonymous selection may persist locally.

Campus context prioritizes rather than hides cross-campus content.

## Public navigation

Desktop:
- Latest
- Campus
- Watch
- Opportunities
- Events
- Explore
- Search
- Campus selector

Mobile:
- Home
- Latest
- Campus
- Watch
- Search

Opportunities, Events and Campus Guide are prominent via Home/Explore.

Do not put every Programme/Topic into primary navigation.

## Search

Search is a core product.

Index:
- Article
- BreakingUpdate
- University
- Campus
- Programme
- Episode
- Opportunity
- Event
- Vendor

Expected intent:
- “Makerere” → University/Campus first
- “Hotseat” → Programme first
- “internships” → open Opportunities first
- event-like query → upcoming Events

Search failure must not break the rest of the site.

Track no-result queries.

## Breaking

BreakingUpdate != Article.

It is optimized for speed:
- headline;
- Campus;
- short update;
- source/verification;
- timestamp;
- chronology;
- developing state.

A developing story updates at one URL.

Later it links to full Article.

Do not create duplicate pages for every incremental update unless editorially distinct.

## Opportunities

Deadline is structured.

When deadline passes:
- remove from active discovery;
- direct URL remains;
- clearly display Applications Closed.

Paid promotion does not bypass verification.

## Events

Structured start/end.

State:
- Upcoming
- Happening Now
- Completed
- Postponed
- Cancelled

Completed Event may surface recap/photos/video.

## Vendors

Public name: Campus Guide.

No marketplace checkout in V1.

Actions:
- WhatsApp
- Call
- Directions
- Website

Featured/promoted state is disclosed.

## Newsroom authorization

Enforce server-side.

Potential capabilities:
- editorial.create
- editorial.submit
- editorial.review
- editorial.verify
- editorial.publish
- editorial.escalate
- breaking.submit
- breaking.review
- breaking.publish
- programme.manage
- campaign.manage
- vendor.approve
- platform.health.view
- platform.jobs.retry
- users.manage
- audit.view

Use `access-control.md`.

Campus scoping is required for correspondents.

## Sensitive data

Never expose publicly:
- private source contact/identity;
- source internal notes;
- internal editorial comments;
- Campaign budgets/contracts;
- staff permissions;
- audit;
- secrets/tokens;
- private user fields.

Create explicit tests for data leakage.

## Jobs

Support:
- scheduled publishing;
- Opportunity expiration;
- Event completion;
- Breaking banner expiry;
- Search indexing;
- overdue Assignment flags.

Jobs must be observable/retryable.

Scheduled publish failure:
- visible;
- alert responsible role;
- Control entry;
- safe retry.

## Design direction

Visual strategy:

> **Editorial confidence with cultural energy.**

Core idea:

> **The Campus Signal**

Avoid generic “AI slop”:
- endless rounded cards;
- giant radii;
- glassmorphism;
- meaningless gradients;
- icon-bubble dashboards;
- excessive shadows;
- generic streaming rows.

Prefer:
- editorial typography;
- strong rules/dividers;
- asymmetrical grids;
- real campus photography;
- location/time metadata;
- ranked lists;
- clear density;
- restrained motion.

Public = expressive.
Newsroom = focused.
Control = analytical.

Use `design-system.md`.

## Accessibility

Target WCAG 2.2 AA.

Every significant component needs:
- keyboard;
- focus;
- labels;
- contrast;
- touch target;
- loading/error/empty states.

## Performance

Mobile performance is a product requirement.

Targets:
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

Rules:
- no autoplay homepage video;
- responsive images;
- adaptive video;
- text first;
- lazy loading;
- minimal unnecessary client JS.

## Engineering standards

- TypeScript strict.
- Validate all writes server-side.
- Prefer server rendering for editorial content.
- No DB access from UI components.
- No raw Payload docs in public client code.
- Small reviewable modules.
- Tests for workflow, permissions and temporal states.
- Migrations for schema.
- Significant architecture changes require ADR.
- Keep docs current.

## V1 exclusions

Do not implement unless explicitly requested:
- native apps;
- marketplace;
- student DMs;
- social groups;
- public comments;
- TikTok algorithm feed;
- AI journalism;
- AI chat Search;
- creator monetization;
- full CRM;
- accounting;
- custom video editor;
- custom livestreaming;
- East Africa-wide launch.

## Implementation order

Follow `implementation-plan.md`.

Start with:
1. foundation;
2. shared domain enums/types;
3. Users/roles/capabilities;
4. Geography;
5. Media;
6. Article;
7. BreakingUpdate;
8. public-safe serializers;
9. workflow access;
10. mobile Breaking submission;
11. Breaking public page;
12. Review Queue;
13. Article public page;
14. SearchAdapter;
15. jobs;
16. audit.

The first real success condition is not a beautiful homepage.

It is:

> A Campus Correspondent can submit a real Breaking development from a phone, an Editor can verify and publish it safely, and a student can open the direct link quickly without logging in.

Build from that center outward.

## Milestone completion format

At each milestone report:
- implemented;
- migrations;
- environment variables;
- access/security implications;
- tests;
- performance/accessibility notes;
- known limitations;
- documentation updated.
