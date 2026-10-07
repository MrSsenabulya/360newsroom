# Campus 360 — Wireframes & Interaction Rules

## Public mobile shell

```text
┌──────────────────────────────┐
│ CAMPUS 360        Makerere ▾ │
├──────────────────────────────┤
│                              │
│          CONTENT             │
│                              │
├──────────────────────────────┤
│ Home Latest Campus Watch  ⌕  │
└──────────────────────────────┘
```

Bottom nav persists on major browsing surfaces.

May disappear on:
- immersive media;
- focused internal submission;
- specific task views.

## Mobile Home hierarchy

1. Breaking if active
2. Lead Story
3. Quick access: Opportunities / Events / Guide
4. Latest
5. Selected Campus
6. Opportunities
7. Watch
8. Events
9. Shorts
10. Trending
11. disclosed commercial module

No giant autoplay hero video.

## Latest

High-density:
- time;
- headline;
- Campus/Topic;
- optional thumbnail;
- Breaking marker.

## Breaking page

Priority:
- label;
- headline;
- updated time;
- Campus;
- verification/source;
- latest update;
- chronology;
- developing state;
- Full Story link.

No unrelated recommendation block above the answer.

## Article

Order:
- Campus/Topic kicker;
- headline;
- standfirst;
- author;
- publish/update;
- hero;
- body;
- context/related;
- Correction;
- share.

Constrain reading width.

## Campus Selector

Mobile sheet; desktop popover/dialog.

Show:
- current;
- Search;
- recent;
- universities;
- All Campuses.

Persist locally without account.

## Campus Hub

- Top Story
- Happening Now
- Latest
- Events
- Opportunities
- Watch
- Trending
- Campus Guide

If local content is sparse, add important cross-campus content instead of dead empty zones.

## Search

### Empty
- field;
- trending;
- recent.

### Typing
- limited entity suggestions;
- “See all results”.

### Results
Group by type where helpful.

### No result
- alternatives;
- optional demand signal.

### Unavailable
- graceful message;
- links to Latest/Campus/Opportunities/Events.

## Opportunities

Landing:
- Search;
- type shortcuts;
- Closing Soon;
- Latest.

Detail:
- type;
- title;
- organization;
- location/work mode;
- deadline;
- remaining;
- Apply;
- about;
- eligibility;
- source.

Expired:
- Applications Closed;
- remove Apply;
- show similar open items.

## Events

States:
Upcoming → Happening Now → Ended.

Also:
- Postponed
- Cancelled

Do not quietly alter postponed date.

## Watch

Sections:
- Featured
- Programmes
- Latest
- Shorts
- Films & Docs

Avoid endless identical rows.

## Programme/Episode

Programme:
- identity;
- description;
- latest;
- archive;
- Shorts;
- related.

Episode:
- player;
- title;
- Programme;
- guest/host;
- description;
- transcript/chapters;
- clips;
- next;
- related.

## Video states

- poster;
- buffering;
- playing;
- paused;
- slow connection;
- error;
- unavailable.

Textual content remains if video fails.

## Campus Guide

Entry:
Search → Vendor
or
Campus → Guide → Category → Vendor.

Actions:
- WhatsApp
- Call
- Directions
- Website

No login.

## Poor network/offline

If Article loaded:
- keep it;
- show quiet offline message;
- media can fail separately.

If navigation fails:
- Retry;
- optionally cached/recent.

Do not wipe form input on network failure.

## Newsroom — Correspondent

Home:
- large Submit Breaking;
- assignments;
- revisions;
- recent.

Breaking form:
- What happened?
- Campus
- When?
- Source
- source classification
- Evidence
- note

After submit:
- confirmation;
- timestamp;
- Awaiting Review;
- prevent duplicate.

## Newsroom — Editor

Desk:
- Breaking;
- Review Queue;
- overdue;
- scheduled failures;
- Today.

Breaking actions:
- Hold
- Request Verification
- Dismiss
- Escalate
- Publish

Dismiss requires reason.

Low-verification publish requires privilege/audit.

## Article Review

Split:
- content;
- workflow/verification/source/risk panel;
- comments;
- actions.

Actions:
- Request Changes
- Send to Verification
- Approve
- Publish

## Scheduled failure

Show:
- high-visibility alert;
- reason;
- retry;
- Open Content;
- team notification;
- Control alert.

## Control interaction

Overview → anomaly → drill-down → action.

Examples:
- Search degraded → Search Health → failures → Retry.
- Campaign behind → Campaign → incomplete Deliverables → assign/update.
- Vendor expiring → Vendor → performance → renewal.

## Destructive actions

Confirm:
- deactivate user;
- suspend Vendor;
- cancel Campaign;
- destructive delete.

Explain consequence.

## State inventory

- default
- loading
- empty
- partial
- error
- offline
- expired
- cancelled
- developing
- archived
- permission denied
- unverified
- scheduled
- processing
- failed
- sponsored
- hidden

## Scroll

Public:
- header may compact;
- bottom nav remains on primary screens;
- avoid aggressive sticky UI.

Do not implement floating video everywhere.

## Forms

- clear labels;
- inline errors;
- preserve input;
- server validation;
- no whole-form reset on one bad field.

## Analytics annotations

Important:
- campus_selected
- search_submitted
- search_result_clicked
- share_clicked
- opportunity_apply_clicked
- event_ticket_clicked
- vendor_whatsapp_clicked
- video_started
- video_completed

## Critical prototype tasks

Student:
- verify Breaking;
- change Campus;
- find internship;
- find weekend Event;
- watch latest Hotseat;
- find Vendor;
- Search.

Newsroom:
- submit Breaking;
- review Breaking;
- request Article changes;
- resubmit;
- approve/schedule.

Control:
- diagnose Search;
- late Campaign Deliverable;
- Vendor renewal.
