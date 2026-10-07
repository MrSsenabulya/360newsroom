# Campus 360 — Analytics & Observability

## Product analytics goal

Measure whether Campus 360 becomes a habit and solves student jobs, not only page views.

North Star:
> **Weekly Active Students**

## Core public events

### Discovery
- `home_viewed`
- `latest_viewed`
- `campus_selected`
- `campus_hub_viewed`
- `search_submitted`
- `search_result_clicked`
- `search_no_results`

### Editorial
- `content_viewed`
- `article_read_depth`
- `breaking_viewed`
- `breaking_update_seen`
- `share_clicked`

### Media
- `video_started`
- `video_25`
- `video_50`
- `video_75`
- `video_completed`
- `episode_related_clicked`
- `short_to_episode_clicked`

### Opportunities
- `opportunity_viewed`
- `opportunity_apply_clicked`

### Events
- `event_viewed`
- `event_ticket_clicked`
- `event_directions_clicked`

### Vendors
- `vendor_viewed`
- `vendor_whatsapp_clicked`
- `vendor_call_clicked`
- `vendor_directions_clicked`
- `vendor_website_clicked`

## Event properties

Use contextual, low-risk properties:
- contentId;
- contentType;
- Campus/University content context;
- Topic;
- Programme;
- placement/module;
- referrer class;
- Sponsor/Campaign id only when analytically necessary and allowed.

Do not infer precise user location merely because content is about a Campus.

## Search intelligence

Record:
- query;
- normalized query if useful;
- result count;
- selected entity type;
- selected result id;
- active Campus context;
- no-results.

Use no-result data for editorial demand analysis.

## Newsroom analytics

Operational, not productivity surveillance.

Track:
- eventOccurredAt;
- submittedAt;
- firstPublishedAt;
- review start/end;
- Changes Requested count;
- Breaking response time;
- scheduled failures.

Metrics:
- median event-to-publish;
- median review time;
- overdue Assignments;
- coverage by Campus;
- Corrections.

Use to identify process bottlenecks, not simplistic individual performance scoring.

## Commercial analytics

Campaign:
- deliverable completion;
- placement impressions where reliable;
- content reach;
- video views/completion;
- clicks/actions;
- campus breakdown;
- renewal history.

Vendor:
- profile views;
- WhatsApp;
- Call;
- Directions;
- Website.

## Observability

Technical truth should come from monitoring/logging systems.

360 Control presents:
- service status;
- failed jobs;
- Search indexing;
- Video processing;
- Storage state;
- scheduled publishing.

## Structured logging

Include:
- timestamp;
- level;
- service;
- environment;
- request/correlation id;
- operation;
- non-sensitive entity ids;
- safe error category.

Never log:
- passwords;
- tokens;
- confidential source notes;
- secret keys;
- unnecessary PII.

## Alerts

### Critical
- public site down;
- database unavailable;
- auth/security incident.

### High
- scheduled publication failed;
- Search seriously degraded;
- video processing stuck for launch-critical asset.

### Action required
- Campaign near end with incomplete deliverables;
- Vendor renewal;
- Assignment overdue.

Route alerts to responsible role.

## Privacy

Analytics should be proportionate.

Do not create individual surveillance profiles when aggregate product insight is sufficient.

Public account tracking, when accounts exist, should have clear privacy rationale.
