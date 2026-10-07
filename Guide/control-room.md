# Campus 360 — 360 Control Architecture

## Purpose

360 Control answers:

> Is Campus 360 healthy, growing, earning, secure and operating properly?

It is not a second Newsroom and should not duplicate Article editing.

## Primary modules

- Overview
- Audience
- Commercial
- Vendors
- Operations
- People
- Platform
- Reports
- System

## Core interaction model

> **Overview → anomaly → drill-down → action**

Dashboard content should be:
- status;
- trend;
- action.

Avoid decorative vanity dashboards.

## Roles

Potential:
- Executive / Founder
- Editor-in-Chief
- Commercial Director
- Account Manager
- Vendor Manager
- Growth/Audience Manager
- Operations Manager
- Platform Administrator
- Finance/Management Viewer
- Super Admin

Role-aware dashboards are expected.

## Audience

Questions:
- Who uses Campus 360?
- Which campuses grow?
- What content drives return?
- Where does audience come from?
- What are users searching?
- What utility actions occur?

Core metrics:
- Weekly Active Students
- Returning rate
- device mix
- acquisition
- campus distribution
- top content
- opportunity apply clicks
- event actions
- vendor referrals
- programme completion

Do not overcollect personal data.

## Campus analytics

Per campus:
- active audience;
- returning audience;
- top topics;
- top Programme;
- top Searches;
- top Events;
- Vendor actions;
- trend.

Useful for editorial and sponsorship.

## Search intelligence

P2 after traffic.

Show:
- top queries;
- no-result queries;
- result CTR;
- campus-specific demand.

Optional action:
- Create Story Idea from query.

## Content performance

Different entities use different metrics.

Article:
- views/read depth/shares.

Breaking:
- speed/return-to-update.

Opportunity:
- Apply clicks.

Event:
- ticket/directions/share.

Vendor:
- WhatsApp/call/directions.

Episode:
- starts/watch time/completion/clip conversion.

## Commercial

Structure:
- Overview
- Sponsors
- Campaigns
- Inventory
- Leads
- 360 Studio later
- Reports

Do not become accounting software or full CRM.

## Sponsor

Track:
- organization;
- contacts;
- active/historical Campaigns;
- relationship;
- last contact;
- renewal;
- notes.

## Campaign

Fields:
- name;
- sponsor;
- owner;
- objectives;
- start/end;
- contract value reference;
- target campuses;
- audience;
- status;
- deliverables;
- placements;
- assets;
- notes/files.

Status:
Lead → Proposal → Contracted → Setup → Scheduled → Live → Paused → Completed → Reported → Renewal/Cancelled.

## Deliverables

Each sponsor promise:
- deliverable;
- due date;
- owner;
- status;
- related content;
- notes.

Calculate:
- time elapsed;
- delivery complete;
- delivery health.

Commercial monitors editorial deliverables but does not edit journalism.

## Inventory

Possible inventory:
- Programme presenting sponsor;
- 360 News sponsor;
- Hotseat sponsor;
- Opportunities sponsor;
- Fresher Guide partner;
- Homepage feature;
- Campus Page feature;
- Sponsored Story;
- newsletter;
- push later;
- Event coverage;
- activation;
- 360 Studio.

P2: exclusivity conflict warning.

## Leads

Pipeline:
New → Contacted → Qualified → Proposal → Negotiation → Won/Lost/Follow-up.

Fields:
- organization;
- contact;
- interest;
- campuses;
- budget range;
- source;
- owner;
- next follow-up;
- notes.

## Vendor Operations

Public: Campus Guide.

Lifecycle:
Enquiry → Verification → Approved → Listing Setup → Active → Renewal Due → Renewed/Expired.

Track:
- active;
- pending;
- expiring;
- suspended;
- featured;
- package;
- referrals.

Verification:
- business identity;
- contact;
- location;
- category;
- images;
- campus relevance;
- package;
- policy.

## Editorial Operations

Leadership metrics:
- published today;
- Breaking count;
- median publish time;
- Review Queue;
- overdue Assignments;
- Corrections;
- coverage by campus.

Deep-link to Newsroom for action.

## People & Access

Internal:
- staff;
- Contributors;
- correspondents;
- commercial staff;
- admins.

Fields:
- name;
- email;
- roles;
- campuses;
- team;
- status;
- last login;
- MFA;
- sessions.

Deactivate:
- invalidate sessions;
- remove access;
- preserve authorship;
- audit.

## Platform Health

Components:
- Public Web
- Payload
- PostgreSQL
- Search
- Object Storage
- Video
- Email/notifications later
- Jobs

States:
- Healthy
- Degraded
- Unavailable

No raw secrets in UI.

## Jobs

Show:
- scheduled;
- running;
- completed;
- failed;
- retry;
- reason.

Scheduled publishing failures are high priority.

## Search health

- indexed count;
- pending;
- failed;
- last sync;
- latency if available.

## Storage/Video

Storage:
- usage;
- growth;
- unknown-rights media;
- unused/orphan media later.

Video:
- processing;
- ready;
- failed;
- processing time;
- provider status.

## Integrations

Show:
- connection status;
- last sync;
- credential-expiry warning;
- owner.

Never display production secret values casually.

## Moderation/Submissions

Potential queues:
- Story Tips
- Vendor Applications
- Opportunity Submissions
- reported content later

Story Tip can become:
- Breaking;
- Story Idea;
- Dismiss;
- Escalate.

## Security dashboard

Potential:
- MFA adoption;
- active staff;
- suspicious logins;
- locked accounts;
- stale sessions;
- last review.

## Audit Log

Append-only operational history.

Examples:
- Article published;
- Campaign dates changed;
- user deactivated;
- Vendor approved;
- Opportunity expired by system.

Filters:
- user;
- action;
- object;
- date;
- module.

## Notifications

Categories:
- Critical
- Action Required
- Informational

Route by role:
- campaign → commercial;
- Search outage → platform;
- review slowdown → EIC;
- vendor renewal → Vendor Manager.

## Reports

Recurring:
- Weekly Editorial
- Monthly Audience
- Monthly Commercial
- Platform Health
- Sponsor report

PDF automation later.

## Boundaries

### Finance
Track value/payment status/invoice reference.
Do not build general ledger/payroll/tax.

### CRM
Basic pipeline only.
Integrate dedicated CRM when scale requires.

### Monitoring
Control summarizes monitoring; it is not the monitoring engine.

## P0 screens

- Overview
- Sponsors
- Campaigns
- Campaign Deliverables
- Vendors if Guide launches
- People & Access
- Platform Health
- Failed Jobs
- Audit Log

P1:
- Audience analytics
- Campus analytics
- Editorial Health
- Leads
- scheduled-content monitor
- Vendor performance
- Notifications
- Search health

P2:
- Search Intelligence
- Studio PM
- automated sponsor reports
- exclusivity conflicts
- advanced security
- data governance
