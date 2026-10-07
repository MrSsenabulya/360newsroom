# Campus 360 — V1 Product Requirements

## MVP definition

> The smallest operational version that lets students discover timely campus information and original media, lets the newsroom publish it quickly, and lets management operate the platform responsibly.

V1 contains:
- Public Web
- Newsroom
- 360 Control

## Priority model

- **P0 Must Have** — launch-critical.
- **P1 Should Have** — strong V1/near-core.
- **P2 Could Have** — useful but non-blocking.
- **Not V1** — intentionally excluded.

---

# Public Web

## P0 Global Shell

- responsive mobile-first shell;
- desktop header;
- mobile bottom nav;
- Campus selector;
- Search;
- Breaking banner;
- footer;
- sharing;
- sponsored disclosures;
- loading/empty/error;
- 404/500.

## P0 Home

Editorial composition:
- Breaking if active;
- Lead Story;
- Latest;
- selected campus;
- Watch;
- Opportunities;
- Events;
- Trending.

Editors can control prominence using safe layout recipes.

## P0 Latest

- chronological feed;
- Breaking + editorial;
- All / selected Campus / basic News filter;
- timestamps;
- campus;
- content type;
- pagination/load more.

## P0 Article

- headline;
- standfirst;
- type;
- author;
- publish/update;
- campus/university;
- hero;
- body;
- related;
- share;
- Corrections;
- sponsor disclosure.

## P0 Breaking Update

- Breaking/Developing;
- headline;
- short update;
- campus;
- publish/update time;
- verification/source context;
- timeline;
- full Article link;
- fast loading.

## P0 Campus

- browse/search universities;
- choose/reset;
- local preference;
- Campus hub with top story/latest/events/opportunities/watch/trending.

## P0 Watch

- Featured
- Latest
- Programmes
- Shorts
- Films & Docs

## P0 Programme

- identity;
- description;
- latest Episode;
- Episodes;
- Shorts;
- related Articles.

## P0 Episode

- player;
- Programme;
- title;
- guest/host;
- date;
- duration;
- related clips;
- related Episodes;
- related Articles;
- sponsor disclosure;
- transcript strongly encouraged.

## P0 Shorts

- card;
- direct URL;
- player;
- relationships.

No TikTok-style infinite feed required.

## P0 Opportunities

Types:
- Internships
- Graduate Jobs/Jobs
- Scholarships
- Fellowships
- Competitions
- Other

Filters:
- type;
- active/expired;
- location where useful.

Detail:
- title;
- organization;
- type;
- location/work mode;
- compensation if known;
- eligibility;
- deadline;
- time remaining;
- description;
- source;
- Apply.

Expired:
- removed from active listing;
- direct URL stays;
- “Applications Closed”.

## P0 Events

- upcoming;
- this week;
- Campus filter;
- detail;
- temporal states;
- ticket/registration/directions;
- completed;
- postponed;
- cancelled.

## P0 Search

Across:
- Articles
- Breaking
- Universities
- Campuses
- Programmes
- Episodes
- Opportunities
- Events
- Vendors

Entity-aware.

Core result filters:
- All
- News
- Watch
- Opportunities
- Events

Track no-result.

## P0 Sharing

- WhatsApp;
- copy link;
- native share where available.

## P1 Public

- Podcasts
- Campus Guide
- simple Merch
- Topic pages
- Collections
- advanced search filters
- richer transcripts

## Accounts

Not P0.

Later:
- save;
- My Campus sync;
- reminders;
- notifications.

---

# Newsroom

## P0 Auth/RBAC

- secure internal auth;
- server permissions;
- role visibility;
- Campus scoping;
- MFA privileged.

## P0 Collections

- Users
- Countries/Universities/Campuses
- Articles
- BreakingUpdates
- Topics
- Media
- Programmes
- Episodes
- Events
- Opportunities
- People
- Organisations

## P0 Workflow

- Draft
- In Review
- Changes Requested
- Verification
- Ready
- Scheduled
- Published
- Archived

## P0 Breaking Fast Lane

Correspondent mobile:
- what happened;
- campus;
- source;
- evidence;
- time.

Editor:
- verify;
- edit;
- hold;
- request verification;
- escalate;
- publish;
- convert to Article.

## P0 Source verification

Structured source data + verification state.

## P0 Review Queue

- priority;
- reporter;
- age;
- campus;
- verification.

## P0 Versions

- history;
- restore;
- editor;
- timestamps.

## P0 Scheduling

- now;
- scheduled;
- failure alert.

## P0 Media

- object storage;
- rights;
- alt;
- caption;
- credit;
- uploader.

## P0 Programme/Episode

- create;
- video;
- thumbnail;
- guest/host;
- topic;
- campus;
- sponsor;
- schedule;
- publish without developer.

## P1 Newsroom

- Story Ideas
- Assignments
- My Desk
- Editorial Calendar
- formal Corrections
- Shorts
- Films
- Podcasts
- Distribution
- newsroom analytics

---

# 360 Control

## P0

- secure access;
- Overview;
- Sponsors;
- Campaigns;
- Campaign Deliverables;
- Vendors if Guide launches;
- People & Access;
- Platform Health;
- Failed Jobs;
- Audit.

## P1

- Audience analytics;
- Campus analytics;
- Editorial Health;
- Leads;
- scheduled content;
- Vendor performance;
- Notifications;
- Search/Storage/Video health.

## P2

- Search Intelligence;
- Studio PM;
- sponsor report automation;
- exclusivity conflict detection;
- advanced security;
- data governance.

---

# Platform

## P0 infrastructure

- Next.js
- Payload
- PostgreSQL
- S3-compatible storage
- video service
- Search abstraction/service
- Analytics
- Monitoring
- jobs worker
- backups
- CDN/edge where appropriate

## Performance

Targets:
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

Rules:
- no autoplay Home video;
- text first;
- responsive images;
- adaptive video;
- lazy load;
- minimal unnecessary JS.

## Accessibility

Target WCAG 2.2 AA.

- keyboard
- focus
- contrast
- semantic HTML
- alt
- accessible forms
- captions/transcripts
- touch target
- reduced motion

## SEO

- server-render/indexable;
- canonical;
- XML sitemap;
- robots;
- OG;
- clean URLs;
- structured data where valid.

Potential schema:
- NewsArticle/Article
- VideoObject
- PodcastEpisode
- Event
- Organization
- JobPosting only when appropriate

## Analytics events

At minimum:
- content_viewed
- article_read_depth
- campus_selected
- search_submitted
- search_result_clicked
- share_clicked
- video_started
- video_25/50/75/completed
- opportunity_apply_clicked
- event_ticket_clicked
- vendor_whatsapp_clicked
- vendor_call_clicked
- vendor_directions_clicked

## Security

- HTTPS;
- RBAC;
- MFA;
- validation;
- upload checks;
- rate limiting;
- secret management;
- session revocation;
- audit;
- backups;
- least privilege.

## Governance launch pages

- Privacy
- Terms
- Editorial Standards
- Corrections Policy
- Advertising/Sponsored Policy
- Contact
- Submit a Tip

## Launch blockers

Do not launch if:
- Breaking unreliable;
- reporter can bypass review;
- Search cannot find core content;
- site too slow on common phones;
- video blocks Article;
- private source fields leak;
- scheduling unreliable;
- backups absent;
- severe accessibility failures;
- campus pages are dead;
- expired Opportunities look active;
- sponsored content is unlabeled;
- monitoring absent.

## Not V1

- native iOS/Android;
- marketplace;
- Vendor checkout;
- student DMs;
- social network/groups/Spaces;
- mandatory profiles;
- TikTok algorithm feed;
- advanced AI recommendation;
- AI chat Search;
- AI-generated journalism;
- public comments without moderation plan;
- creator monetization;
- full CRM;
- accounting;
- custom video editor;
- custom livestream platform;
- East Africa-wide launch.

## Launch readiness

Product:
- P0 journeys work on real phones.

Editorial:
- team publishes without developer.

Content:
- enough current content to feel alive.

Commercial:
- Campaigns/listings work without code.

Operations:
- monitoring, backups, access and ownership are clear.
