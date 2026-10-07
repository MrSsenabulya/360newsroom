# Campus 360 — Implementation Plan

## Strategy

Do not build everything at once.

Each milestone should leave a coherent testable system.

## Milestone 0 — Foundation

### Repository
- monorepo;
- TypeScript strict;
- lint/format;
- tests;
- env strategy;
- CI baseline.

### Apps
- public web shell;
- Control shell;
- Payload foundation.

### Infrastructure
- PostgreSQL;
- object-storage dev adapter;
- internal auth;
- environments;
- monitoring;
- secrets;
- jobs worker.

### Design foundation
- tokens;
- typography;
- spacing;
- primitives.

Exit:
- apps deploy;
- DB migrations work;
- Payload works;
- login works;
- health endpoint works.

## Milestone 1 — Content Core

Implement:
- Countries
- Universities
- Campuses
- Topics
- People/Organisations
- Media
- Articles
- BreakingUpdates
- Programmes
- Episodes

Public:
- Article
- Breaking
- basic Campus
- Programme/Episode

Exit:
- Editor publishes core content;
- public consumes without login.

## Milestone 2 — Newsroom

Implement:
- roles/capabilities;
- Campus scoping;
- workflow transitions;
- Sources;
- Review Queue;
- Breaking Fast Lane;
- mobile submission;
- Versions;
- EditorialActivity;
- scheduling;
- publish guards;
- high-risk escalation.

Exit:
- Correspondent submits Breaking from phone;
- Editor publishes;
- Reporter cannot bypass;
- Article review works;
- scheduling works.

## Milestone 3 — Public Information Product

- public navigation;
- Home;
- Latest;
- Campus directory/context;
- local Campus preference;
- Search;
- Watch;
- Programme;
- Episode;
- sharing;
- SEO;
- sitemap.

Exit:
- core student journeys complete.

## Milestone 4 — Utility

- Opportunities;
- Events;
- temporal automation;
- Campus Guide basic;
- Podcasts if ready;
- Topic hubs;
- Collections if useful.

Exit:
- platform clearly exceeds “online TV”.

## Milestone 5 — Commercial & Control

- Sponsors;
- Campaigns;
- Deliverables;
- Vendors;
- People & Access;
- Health;
- Jobs;
- Audit;
- Control Overview.

P1:
- audience;
- editorial health;
- Leads;
- scheduled-content monitor.

Exit:
- sponsor/vendor workflows operate without code changes.

## Milestone 6 — Launch Hardening

- performance;
- accessibility;
- SEO;
- security;
- backups/restore;
- monitoring;
- devices/browsers;
- content migration;
- newsroom training;
- incident drill;
- scheduled-publish drill;
- Search failure drill;
- commercial workflow rehearsal.

## Epics

### A Identity & Access
Auth, roles, capabilities, Campus scoping, MFA, sessions, deactivation.

### B Geography
Country, University, Campus, selector, context.

### C Editorial
Article, Breaking, Topic, Sources, Review, Corrections.

### D Media
Media, Programme, Episode, Short, VideoAdapter.

### E Search
SearchAdapter, indexing, public Search, health/retry.

### F Utility
Opportunities, Events, Vendors/Guide, time jobs.

### G Newsroom UX
My Desk, Breaking Desk, Review Queue, Calendar, Programme Desk.

### H Commercial
Sponsor, Campaign, Deliverable, Placement, Lead.

### I Control
Overview, Health, Jobs, Vendors, Users, Audit.

### J Analytics
event contract, public tracking, Control summaries.

### K Governance
policies, disclosure, Corrections, rights.

## First Cursor implementation sequence

After scaffold approval:

1. shared domain enums/types;
2. geography;
3. Users/roles/capabilities;
4. Media;
5. Articles;
6. BreakingUpdates;
7. public-safe serializers;
8. workflow access;
9. mobile Breaking submission;
10. Breaking public page;
11. Review Queue;
12. Article public page;
13. SearchAdapter interface;
14. jobs foundation;
15. audit foundation.

The first success condition is:

> A campus correspondent submits a real Breaking development from a phone, an editor verifies/publishes it safely, and a student opens the direct link quickly without login.

## Migration

Inventory old content.

Classify:
- evergreen/value → migrate;
- historical → selective;
- duplicate/low quality → omit;
- outdated utility → not active.

Map:
- old Shows → Programmes;
- videos → Episodes;
- Quickies → Shorts when valuable;
- podcasts → structured Podcast entities;
- stories → Articles;
- current Events/Opportunities → structured entities.

Create redirect mapping for old public URLs.

## Launch campuses

Do not activate every university simply because schema allows it.

Activate where there is:
- meaningful profile;
- current content;
- editorial ownership;
- sources/contributors;
- enough activity to avoid a dead page.

## Epic definition of done

- schema/migration;
- access;
- service/API;
- UI;
- states;
- tests;
- analytics if needed;
- accessibility;
- docs;
- monitoring where relevant.

## Likely V1.1

Potential:
- public accounts;
- Saved;
- synced My Campus;
- Opportunity reminders;
- push;
- richer Podcasts;
- deeper Guide;
- Search Intelligence;
- more custom Payload views.

Do not pre-build without evidence.
