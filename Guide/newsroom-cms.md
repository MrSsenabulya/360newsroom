# Campus 360 — Payload Newsroom Specification

## Purpose

The Newsroom is an editorial operating system, not merely a content uploader.

It should help Campus 360:
- find stories;
- assign work;
- report;
- verify;
- review;
- publish quickly;
- manage programmes;
- correct errors;
- understand bottlenecks.

Payload CMS is the foundation.

## Newsroom navigation

### Desk
- My Work
- Assignments
- Breaking Desk
- Review Queue
- Editorial Calendar

### Publishing
- Articles
- Breaking Updates
- Events
- Opportunities
- Collections

### Programmes
- Programmes
- Episodes
- Shorts
- Films & Docs
- Podcasts

### Media
- Images
- Video references
- Audio
- Documents

### Reference
- Universities
- Campuses
- Topics
- People
- Organisations
- Contributors

Commercial/platform complexity should not clutter ordinary editorial navigation.

## Progressive customization

### V1A
Use Payload native admin with:
- Campus 360 branding;
- grouped navigation;
- role-based collection visibility;
- access rules;
- a few critical custom actions.

### V1B
Add:
1. My Desk
2. Breaking Desk
3. Review Queue
4. Editorial Calendar
5. Programme Desk

Do not rebuild Payload unnecessarily.

## Roles

### Editor-in-Chief
- final editorial authority;
- high-risk approvals;
- policy;
- all newsroom visibility.

### Managing Editor / Editor
- assignments;
- review;
- verification;
- changes requests;
- scheduling;
- publishing.

### Journalist
- own drafts;
- sources;
- submit;
- revise;
- cannot publish directly.

### Campus Correspondent
- campus-scoped;
- mobile Breaking;
- own drafts;
- cannot publish.

### Programme Producer
- Programmes;
- Episodes;
- media;
- production status.

### Podcast Producer
- podcast entities.

### Distribution Editor
- WhatsApp/social/push/newsletter metadata.

### Contributor
- restricted submissions.

### Newsroom Administrator
- taxonomies and appropriate administrative setup.

## My Desk

Journalist:
- assignments;
- due work;
- returned work;
- developing stories;
- recent work;
- prominent **Submit Breaking Update**.

Editor:
- urgent Breaking;
- Review Queue;
- overdue Assignments;
- scheduled failures;
- today’s calendar.

## Story Ideas

Fields:
- working title;
- pitch;
- campus;
- topics;
- potential sources;
- why it matters;
- format;
- urgency;
- notes;
- status.

Flow:
New → Discussing → Approved / Rejected / On Hold → Assignment.

## Assignments

Fields:
- brief;
- reporters;
- editor;
- campus;
- story type;
- priority;
- deadline;
- target publish;
- expected formats;
- required deliverables;
- related Event;
- commercial obligation if applicable.

States:
Assigned → Accepted → Reporting → Submitted → Completed / Cancelled.

## Standard Article workflow

Draft  
→ In Review  
→ Changes Requested if needed  
→ Verification  
→ Ready  
→ Scheduled / Published  
→ Updated  
→ Archived.

Keep separate:
- workflowStatus;
- verificationStatus;
- editorialRisk;
- priority;
- publicationStatus.

## Transition permissions

| Transition | Reporter | Correspondent | Editor | EIC |
|---|---:|---:|---:|---:|
| Draft → Review | yes | yes | yes | yes |
| Review → Changes Requested | no | no | yes | yes |
| Review → Verification | no | no | yes | yes |
| Verification → Ready | no | no | yes | yes |
| Ready → Scheduled | no | no | yes | yes |
| Ready → Published | no | no | yes | yes |
| High-risk publish | no | no | no/limited | yes |

Server enforces this regardless of UI.

## Article editor

### Main area
- Headline
- Standfirst
- Body
- Hero media

### Editorial panel
- Workflow
- Priority
- Editor
- Campus/University
- Topics
- People
- Event/Programme relations
- Verification
- Source notes
- Publication/schedule
- Distribution metadata
- Related content
- Corrections
- Editorial risk

Use progressive disclosure and role-aware visibility.

## Structured sources

Fields:
- type;
- name/description;
- private contact/identity;
- evidence file/URL;
- information verified;
- reporter notes;
- publicly identifiable?;
- verifiedBy;
- verifiedAt.

Source types:
- Official statement
- Eyewitness
- Interview
- Document
- Public record
- Organisation
- Social post
- Anonymous source
- Other

Verification:
- Unverified
- Verification in progress
- Partially verified
- Verified
- Official confirmation
- Disputed

## Breaking Fast Lane — P0

### Correspondent mobile form
Only:
- What happened?
- Campus
- When?
- Source context
- Evidence
- witness/official/credible-report classification
- optional note

No SEO, sponsor, taxonomy overload or social metadata.

### Breaking Desk
Show:
- campus;
- reporter;
- submission age;
- source;
- evidence;
- verification;
- urgency.

Actions:
- Review
- Request Verification
- Hold
- Dismiss
- Escalate
- Publish

Dismiss requires reason.

### Publish guard
Below verification threshold:
- warn;
- only authorized role can override;
- override audited.

### Developing story
One URL can be updated repeatedly.

### Convert to Article
Prefill:
- headline;
- campus;
- topic;
- reporter;
- media;
- existing update;
- Breaking relationship.

## High-risk content

Risk:
- Normal
- Elevated
- High

Examples:
- deaths;
- serious allegations;
- sexual misconduct allegations;
- criminal accusations;
- defamation exposure;
- sensitive investigations;
- legal threats.

High risk requires EIC approval before publication.

## Review Queue

Filters:
- priority;
- campus;
- reporter;
- age;
- verification;
- state.

Each item:
- headline;
- reporter;
- campus;
- submitted age;
- source count;
- verification;
- priority.

## Request Changes

Reasons:
- Missing verification
- Accuracy
- Headline
- Structure
- Style
- Media
- Other

Flow:
In Review → Changes Requested → reporter revises → Resubmit → In Review.

## Internal comments

Internal only. Never public.

Examples:
- verify number;
- need usable image;
- source confirmed.

## Versions & activity

Use Payload versions for document changes.

Also store `EditorialActivity` for workflow events:
- submitted;
- changes requested;
- resubmitted;
- verified;
- published;
- escalated;
- corrected.

## Scheduling

Support:
- Publish now
- Schedule
- Embargo where needed

Validate:
- required fields;
- permissions;
- verification;
- risk approval;
- video readiness;
- sponsor disclosure.

Failure:
- visible;
- team notification;
- Control alert;
- retry where safe.

## Distribution

Publishing != distribution.

Metadata:
- WhatsApp copy;
- push headline;
- social headline;
- social description;
- social image;
- newsletter queue.

Full automation not required P0.

## Programme workflow

Episode:
Planned → Guest Confirmed → Production → Editing → Review → Ready → Scheduled → Published → Derivatives.

Programme Desk:
- next release;
- production items;
- needs review;
- Shorts pending;
- simple recent performance.

## 360 News

Episode can reference multiple Articles. Do not duplicate story content.

## Derivatives

Episode may generate:
- full video;
- audio;
- Shorts;
- Article;
- quote assets;
- newsletter feature.

Use parent relationships.

## Podcast workflow

Planned → Recorded → Editing → Review → Ready → Scheduled → Published.

## Media governance

Capture:
- title;
- alt;
- caption;
- credit;
- creator;
- copyright owner;
- rights;
- campus;
- event;
- people;
- uploader;
- date.

Unknown rights = warning.

## Event workflow

Created → Verified → Published → Upcoming → Happening Now → Completed → Coverage Added.

Time can automate state.

## Opportunity workflow

Submitted → Source Check → Verified → Published → Closing Soon → Expired → Archived.

Verification checklist:
- source;
- organization;
- deadline;
- application link;
- eligibility;
- scam/payment risk.

## Corrections

Correction captures:
- original info;
- corrected info;
- reason;
- severity;
- approver;
- public note.

Material/Major default to public note.

## Editorial Calendar

Views:
- Day
- Week
- Month
- Agenda
- By Campus
- By Programme
- By Assignee

Contains:
- Assignments
- Events
- Programme releases
- planned Features
- sponsored obligations
- key university dates

## Newsroom metrics

- stories published;
- Review Queue;
- median review time;
- median event-to-publish;
- Breaking awaiting action;
- overdue Assignments;
- Corrections;
- coverage by campus.

Track:
- eventOccurredAt
- submittedAt
- firstPublishedAt

Derive:
- reporter response;
- review time;
- total publish time.

## P0 custom views/actions

Views:
1. My Desk
2. Breaking Desk
3. Review Queue
4. Editorial Calendar
5. Programme Desk

Actions:
- Submit for Review
- Request Changes
- Approve
- Publish
- Schedule
- Convert to Article
- Create Follow-Up
- Issue Correction
- Create Short from Episode
