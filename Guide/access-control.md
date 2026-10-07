# Campus 360 — Access Control & Permission Matrix

## Principle

Authorization is capability-based and enforced on the server.

Roles group capabilities. A user may hold more than one role where organizational reality requires it.

Do not model authorization as one `isAdmin` boolean.

## Core capabilities

### Editorial
- `editorial.create`
- `editorial.editOwn`
- `editorial.editAny`
- `editorial.submit`
- `editorial.review`
- `editorial.requestChanges`
- `editorial.verify`
- `editorial.publish`
- `editorial.schedule`
- `editorial.archive`
- `editorial.correct`
- `editorial.escalate`

### Breaking
- `breaking.submit`
- `breaking.editOwn`
- `breaking.review`
- `breaking.verify`
- `breaking.publish`
- `breaking.overrideVerification`
- `breaking.manageBanner`

### Programme
- `programme.create`
- `programme.edit`
- `episode.create`
- `episode.edit`
- `episode.submit`
- `episode.publish`
- `media.upload`

### Utility
- `event.manage`
- `opportunity.manage`
- `opportunity.verify`
- `vendor.manage`
- `vendor.approve`

### Commercial
- `sponsor.view`
- `sponsor.manage`
- `campaign.view`
- `campaign.manage`
- `campaign.value.view`
- `deliverable.manage`
- `lead.manage`

### Control/Platform
- `analytics.view`
- `editorial.health.view`
- `platform.health.view`
- `platform.jobs.view`
- `platform.jobs.retry`
- `audit.view`
- `users.manage`
- `roles.manage`
- `security.view`

## Suggested role mapping

### Campus Correspondent
- breaking.submit
- breaking.editOwn
- editorial.create
- editorial.editOwn
- editorial.submit
- media.upload
- limited to assigned campuses

No publish.

### Journalist
- editorial.create
- editorial.editOwn
- editorial.submit
- media.upload
- can add Sources
- may edit returned work

No publish.

### Editor
- editorial.editAny
- editorial.review
- editorial.requestChanges
- editorial.verify
- editorial.publish
- editorial.schedule
- editorial.correct
- breaking.review
- breaking.verify
- breaking.publish
- event/opportunity editorial management as assigned

### Editor-in-Chief
All Editor capabilities plus:
- editorial.escalate/final high-risk approval
- breaking.overrideVerification
- broad newsroom visibility
- editorial health access

### Programme Producer
- programme.create/edit
- episode.create/edit/submit
- media.upload
- may schedule/publish only if organizational policy grants it

### Distribution Editor
- public social/distribution metadata
- notification/newsletter queue access
- does not gain fact-editing authority automatically

### Commercial Manager
- sponsor/campaign/deliverable/lead management
- commercial value access
- may see linked editorial deliverable status
- cannot edit Article body, Sources or verification

### Vendor Manager
- vendor.manage
- vendor.approve
- vendor commercial package fields
- no confidential editorial access

### Platform Administrator
- platform health/jobs
- integrations operational settings where appropriate
- users/sessions as assigned
- no editorial publish unless a separate editorial role grants it

### Super Admin
Broad emergency/system authority.
Use sparingly.
Super Admin should not be the default daily role.

## Campus scoping

Users may have:
- `assignedUniversities`
- `assignedCampuses`

A correspondent can create/edit content only within assigned scope.

Editors may be:
- campus scoped;
- national/all campuses.

Server access rules must enforce scope on:
- create;
- read internal drafts where restricted;
- update;
- review;
- assignment.

## Commercial/editorial separation

Commercial may:
- create Campaign;
- define deliverables;
- attach briefing;
- monitor progress;
- view published deliverable.

Commercial may not:
- alter reporting;
- change verification;
- reveal/alter Sources;
- force publication.

## Public/API permission

Anonymous public read only:
- published/public data projections.

No anonymous write except explicitly designed public submission endpoints such as:
- Submit Tip;
- commercial enquiry;
- Vendor enquiry;
- Opportunity submission.

These write endpoints are rate-limited and moderated.

## Deactivation

When user is deactivated:
- sessions revoked;
- login blocked;
- authorship retained;
- audit record generated.

Do not delete contributor identity merely because access is revoked.

## High-risk operations requiring audit

At minimum:
- publish;
- verification override;
- high-risk approval;
- Correction;
- archive/hard delete;
- role change;
- account deactivation;
- Campaign value/date changes;
- Vendor suspension/approval;
- job retry if operationally important.
