# Campus 360 — Engineering Standards

## Language

Use TypeScript strict mode.

Avoid `any` except at narrow, documented boundaries.

## Code organization

Prefer:
- cohesive domain modules;
- typed service boundaries;
- explicit adapters;
- shared contracts;
- shared validation.

Avoid:
- giant utility files;
- direct DB calls throughout UI;
- frontend importing backend internals;
- circular dependencies.

## Validation

All writes validate on the server.

Client validation improves UX but is not a trust boundary.

## Authorization

Every protected action enforces authorization server-side.

UI hiding is secondary.

Test permissions for:
- Reporter
- Correspondent
- Editor
- EIC
- Commercial Manager
- Vendor Manager
- Platform Admin
- Super Admin

## Public DTOs

Never expose raw Payload documents indiscriminately.

Strip:
- private source info;
- internal comments;
- commercial internals;
- permissions;
- audit;
- unnecessary provider metadata.

## Data fetching

Prefer server-side fetching for indexable public content.

Use client fetching for true interaction.

Avoid waterfalls and overfetching.

## State management

Do not add global client state by default.

Prefer:
- server state;
- URL state;
- local component state;
- localStorage only for intentional anonymous preferences such as selected Campus.

## Routes

Use stable semantic routes.

Avoid public raw DB IDs.

If a slug changes and the old URL has public history/SEO, create redirect handling.

## Jobs

Jobs should be:
- idempotent where practical;
- retryable;
- observable;
- auditable for privileged operations.

Examples:
- Search indexing;
- scheduled publish;
- Opportunity expiration;
- Event completion.

## Providers

Use adapters.

Do not call provider APIs directly from feature components.

## Errors

Structured categories:
- validation;
- unauthenticated;
- forbidden;
- not found;
- conflict;
- dependency unavailable;
- internal.

Public messages are useful and non-technical.
Logs may contain technical context but never secrets.

## Logging

Use structured logs.

Include correlation/request IDs where possible.

Never log:
- passwords;
- auth tokens;
- secrets;
- confidential source notes;
- unnecessary PII.

## Security

- HTTPS production.
- Secure cookie/session configuration.
- appropriate CSRF protection.
- rate limit sensitive endpoints.
- validate uploads.
- sanitize rich text/content appropriately.
- audit privileged changes.
- least privilege credentials.

## Testing

### Unit
- business logic;
- temporal state;
- ranking helpers;
- validation;
- permission rules.

### Integration
- Payload hooks;
- workflows;
- Search indexing;
- jobs;
- DTO projections.

### E2E
- Breaking public;
- Opportunity;
- Campus;
- Search;
- Episode;
- Breaking submission;
- Editor publish;
- Campaign Deliverable;
- job retry.

## Accessibility

Automated tests are not enough.

Manual:
- keyboard;
- focus;
- screen-reader smoke test;
- zoom;
- touch;
- contrast.

## Performance

Avoid:
- large client bundles;
- unoptimized images;
- unnecessary animation libraries;
- autoplay;
- giant unpaginated tables.

## Design system

Use shared tokens/components.

Do not hard-code random colors/radii/spacing/shadows inside feature pages without reason.

## Components

Prefer domain-semantic components:
- StoryCard
- OpportunityCard
- EventRow
- ReviewItem
- CampaignDelivery

Do not create one universal Card that becomes everything.

## Forms

- labels;
- server validation;
- preserve input;
- no optimistic success for high-risk operations before server confirmation.

## Time

Store timestamps consistently, generally UTC at persistence/service boundaries.

Render in relevant context.

V1 primary timezone:
`Africa/Kampala`.

Do not implement deadline logic using naive browser-local date strings.

## Database

Use migrations.

No untracked production schema edits.

Likely indexes:
- slug;
- publication status;
- campus relations;
- deadlines;
- publication time;
- frequent filter fields.

Validate final indexes with real query plans.

## Migration scripts

Should be:
- repeatable;
- logged;
- dry-run capable when practical;
- duplicate-aware;
- relationship-aware.

## Documentation

Update docs when changing:
- model;
- permission;
- lifecycle;
- API;
- provider;
- public route.

Use ADR for significant architectural changes.

## PR discipline

Prefer small reviewable changes.

PR should state:
- problem;
- scope;
- architecture impact;
- screenshots for UI;
- tests;
- accessibility;
- migrations;
- rollout risk.

## Avoid premature abstraction

Do not build elaborate generic frameworks before real reuse exists.

Do create provider adapters from the beginning.

## No speculative AI

Do not add:
- AI-generated copy;
- autonomous publishing;
- AI recommendations;
- AI chat Search

unless explicitly scoped later.
