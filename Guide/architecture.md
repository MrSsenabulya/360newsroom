# Campus 360 — System Architecture

## Architectural objective

Support:
- mobile-first public media/information;
- customized Payload Newsroom;
- separate 360 Control;
- relational content;
- fast Breaking publication;
- structured Opportunities/Events/Vendors;
- Programme relationships;
- Search;
- video streaming;
- commercial operations;
- analytics;
- platform health;
- future multi-campus/regional expansion.

## High-level architecture

```text
                         CAMPUS 360

        ┌─────────────────────────────────────┐
        │          PUBLIC WEB / PWA           │
        │             Next.js                 │
        └─────────────────┬───────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Payload   │
                    │ CMS / API  │
                    └─────┬─────┘
                          │
                     PostgreSQL
                          │
          ┌───────────────┼─────────────────┐
          │               │                 │
   Object Storage       Search            Jobs
   Images/Docs       dedicated index      workers
          │                                 │
          └──────────┐             ┌────────┘
                     │             │
               External services
                     │
      ┌──────────────┼───────────────────┐
      │              │                   │
   Video          Analytics          Monitoring
   streaming      /events            /health

INTERNAL
────────────────────────────────────────
Payload Admin → Campus 360 Newsroom
Next.js → 360 Control
```

## Three product surfaces

### Public Web
Discover, understand, watch, search, find Opportunities/Events/services.

### Newsroom
Plan, report, verify, edit, produce, publish.

Payload Admin with targeted custom views.

### 360 Control
Monitor, monetize, govern, operate, maintain.

Custom Next.js internal app.

## Core technology choices

### Frontend
Next.js.

Requirements:
- server rendering for indexable editorial pages;
- route-level caching/revalidation;
- minimal client JS;
- mobile-first;
- typed data boundaries.

### CMS/backend
Payload CMS.

Use:
- code-defined schema;
- custom React/Next admin;
- access control;
- drafts/versions;
- jobs/hooks;
- Postgres.

### Database
PostgreSQL.

### Object storage
S3-compatible.

Use for:
- images;
- documents;
- audio where appropriate;
- thumbnails;
- lightweight media.

No production reliance on local filesystem.

### Video
Dedicated provider via adapter.

Provider owns:
- ingest;
- transcoding;
- adaptive bitrate;
- processing state;
- playback;
- optionally thumbnails/analytics.

Do not serve large video from Next/Payload.

### Search
Production target: dedicated search.

Implement `SearchAdapter`.

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

Development may use a fallback if provider is unresolved, but product behavior must remain consistent.

### Analytics
Event-oriented external analytics.

Do not store high-volume raw analytics in Payload.

### Monitoring
External monitoring provides technical truth.
360 Control presents management-friendly health.

## Repository model

Prefer monorepo.

```text
campus360/
├── apps/
│   ├── web/
│   └── control/
├── payload/
│   ├── src/
│   │   ├── collections/
│   │   ├── globals/
│   │   ├── access/
│   │   ├── hooks/
│   │   ├── jobs/
│   │   ├── workflows/
│   │   ├── components/
│   │   └── payload.config.ts
│   └── migrations/
├── packages/
│   ├── ui/
│   ├── domain/
│   ├── validation/
│   ├── search/
│   ├── video/
│   ├── analytics/
│   ├── auth/
│   └── config/
├── docs/
└── infrastructure/
```

Physical layout may adapt to actual Payload/Next integration; preserve logical boundaries.

## Payload organization

```text
collections/
├── geography/
├── editorial/
├── media/
├── utility/
├── people/
├── newsroom/
├── commercial/
└── system/
```

See `data-model.md`.

## Public data boundary

Never pass raw internal Payload documents indiscriminately.

Create public DTOs/serializers.

Never expose:
- private source notes/contact;
- internal editorial comments;
- commercial contract values;
- unpublished fields;
- audit;
- permissions;
- secrets/provider tokens.

## Authorization

Server-side.

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
- analytics.view
- platform.health.view
- platform.jobs.retry
- users.manage
- roles.manage
- audit.view

Roles group capabilities.

Possible roles:
- Super Admin
- Editor-in-Chief
- Managing Editor
- Editor
- Journalist
- Campus Correspondent
- Programme Producer
- Podcast Producer
- Photographer
- Distribution Editor
- Commercial Manager
- Vendor Manager
- Contributor
- Platform Admin

Campus-scoped permissions support assigned campuses.

## Authentication

Internal:
- secure credentials;
- MFA privileged roles;
- revocable sessions;
- deactivation;
- audit.

Public:
- not required P0;
- anonymous local campus preference;
- later accounts separate from Contributor editorial identity.

## Content lifecycles

Article:
Draft → In Review → Changes/Verification → Ready → Scheduled/Published → Updated → Archived.

Breaking:
Submitted → Verification → Developing → Resolved/Converted → Archived.

Opportunity:
Submitted → Source Check → Verified → Published → Closing Soon → Expired → Archived.

Event:
Created → Verified → Published → Upcoming → Happening Now → Completed → Coverage.

Episode:
Planned → Production → Editing → Review → Ready → Scheduled → Published → Derivatives.

## Jobs/hooks

Required jobs:
- scheduled publish;
- Opportunity expiration;
- Event completion;
- Breaking banner expiry;
- Search indexing;
- overdue Assignment flagging;
- scheduled-content validation.

After publish/update/archive:
- Search sync;
- public revalidation/cache invalidation;
- sitemap update where needed;
- event emission;
- aggregation update if needed.

Before publish:
- required fields;
- permission;
- verification;
- high-risk approval;
- video readiness;
- sponsorship disclosure.

## Search indexing

Use eventual consistency with explicit status.

Index fields:
- id
- type
- title
- URL/slug
- summary
- campus/university
- topics
- publishedAt
- temporal state
- popularity signal if available
- searchable keywords

Search failure:
- must not break whole site;
- visible in Control;
- retryable.

## Caching/revalidation

Public editorial pages should be cacheable while supporting rapid updates.

Requirements:
- Breaking rapid revalidation;
- scheduled publish updates listings;
- archive/expiration updates discovery;
- homepage/campus controlled revalidation.

Use the chosen Next version’s supported primitives.

## Data/API strategy

Prefer typed domain services over ad hoc fetches.

Public services:
- Home composition
- Latest
- Campus
- Article
- Breaking
- Programme/Episode
- Opportunity
- Event
- Vendor
- Search
- Related content

Control:
- Campaign
- Vendor
- User/Role
- Health
- Jobs
- Audit
- Analytics aggregation

UI components do not know database schema details.

## External adapters

Create:
- SearchAdapter
- VideoAdapter
- AnalyticsAdapter
- NotificationAdapter later
- EmailAdapter
- Health/MonitoringAdapter as useful

## Video pipeline

Master upload → provider ingest → processing → adaptive streams → callback/status → Payload reference → public player.

Do not allow a required-video Episode to publish while processing unless explicit fallback is intended.

## Image pipeline

- responsive dimensions;
- modern formats;
- lazy loading;
- CDN;
- alt text;
- caption/credit;
- known dimensions to reduce CLS;
- rights metadata.

## Performance

Target:
- LCP ≤ 2.5 s
- INP ≤ 200 ms
- CLS ≤ 0.1

Rules:
- no autoplay homepage video;
- text before heavy media;
- server-render core content;
- lazy below fold;
- minimize JS;
- optimize fonts/images.

## Resilience

Target public availability around 99.9% as an engineering goal.

Need:
- backups;
- restore;
- health checks;
- monitoring;
- graceful Search/Video failures;
- job retry;
- ownership.

## Security

Mandatory:
- HTTPS;
- strict authz;
- input validation;
- rate limits where needed;
- upload restrictions;
- secrets outside code;
- revocable sessions;
- MFA privileged;
- audit;
- backups;
- least privilege.

Sensitive editorial source data never enters:
- public API;
- Search;
- analytics;
- client bundles.

## Environments

At minimum:
- local;
- shared dev;
- staging;
- production.

Do not casually copy sensitive production data to lower environments.

## Open provider choices

See `open-decisions.md`.

Do not hard-code unresolved vendor choices.
