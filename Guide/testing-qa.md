# Campus 360 — Testing & QA Plan

## Goal

Launch an operationally trustworthy product, not merely visually complete pages.

## Environments

- local;
- shared development;
- staging;
- production.

Staging should exercise:
- auth;
- jobs;
- video callbacks;
- Search;
- storage;
- scheduling;
- cache/revalidation.

## Public E2E

### Breaking
- direct anonymous URL;
- headline/Campus/time/verification visible;
- updates appear after revalidation;
- Full Story relation;
- share.

### Campus
- select without auth;
- preference persists;
- reset All;
- direct unrelated content remains accessible.

### Opportunity
- active appears;
- filters;
- Apply;
- expiration removes from active;
- direct URL says closed.

### Event
- Upcoming;
- Happening Now;
- Ended;
- Postponed;
- Cancelled.

### Watch
- direct Episode;
- adaptive player;
- playback error does not remove text;
- related Programme content.

### Search
- entity suggestion;
- mixed types;
- no-result;
- provider unavailable.

### Campus Guide
- Vendor profile;
- WhatsApp/Call/Directions;
- sponsored label.

## Newsroom E2E

### Correspondent
- mobile login;
- Submit Breaking;
- validation;
- evidence;
- confirmation;
- cannot publish.

### Editor
- urgent submission;
- verify;
- publish;
- audit;
- public result.

### Standard Article
- Draft;
- Submit;
- Changes Requested;
- resubmit;
- verify;
- schedule/publish.

### High risk
- normal editor blocked from final publish if policy requires EIC;
- EIC approval;
- audit.

### Schedule
- success;
- failure;
- retry;
- Control alert.

### Versions
- history;
- restore.

## Control E2E

- health;
- Campaign create;
- Deliverable tracking;
- Vendor approval;
- user deactivation;
- job retry;
- audit.

## Permission tests

Test UI and API.

Reporter:
- cannot publish;
- cannot see commercial secrets.

Commercial:
- cannot edit Article/source notes.

Vendor Manager:
- no confidential editorial access.

Platform Admin:
- health/jobs does not imply editorial publish.

## Leakage tests

Public output must never include:
- source contacts;
- source notes;
- internal comments;
- Campaign values;
- permissions;
- audit;
- secrets;
- private user fields.

## Performance QA

Test:
- common Android-sized viewport;
- throttled mobile;
- cold cache;
- image-heavy Article;
- Episode;
- Home;
- Search.

Targets:
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

## Accessibility QA

Automated + manual:
- keyboard;
- focus;
- heading hierarchy;
- labels/errors;
- screen-reader smoke test;
- 200% zoom;
- reduced motion;
- contrast;
- touch targets.

## Responsive QA

Public:
- mobile;
- tablet;
- desktop;
- wide.

Newsroom:
- mobile Breaking;
- desktop editing.

Control:
- desktop primary;
- mobile alert/read actions.

## Temporal QA

Use controlled clock/test data.

Test:
- closes today;
- deadline passes;
- Event starts;
- Event ends;
- scheduled publish;
- embargo;
- timezone.

## Resilience QA

Simulate:
- Search outage;
- Video outage;
- storage failure;
- job failure;
- offline mid-form;
- API timeout.

Degrade gracefully.

## Content stress tests

- long headline;
- no image;
- no author photo;
- long Campus name;
- missing hours;
- unknown duration;
- no Sponsor;
- multiple Campuses;
- no related content.

## Security QA

- session expiry;
- revoked account;
- escalation attempts;
- direct API publish by Reporter;
- file validation;
- rate limiting;
- CSRF/session controls;
- secret scan;
- dependencies.

## Migration QA

- duplicate slug;
- broken media;
- missing relation;
- expired Opportunity;
- old Event;
- Programme mapping;
- redirects.

## Feature acceptance

Launch-ready when:
- criteria pass;
- permissions pass;
- states exist;
- analytics are purposeful;
- mobile tested;
- accessibility reviewed;
- docs match behavior.
