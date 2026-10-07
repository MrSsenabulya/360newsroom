# Campus 360 — API & Service Contracts

This is a logical contract guide, not a final OpenAPI file.

## Principle

UI components should consume stable typed service outputs, not raw database/Payload records.

Use server-side service functions and public-safe DTOs.

## Public DTO conventions

Every public entity should expose only fields required by the public experience.

Common fields:
- `id`
- `slug`
- `url`
- `type`
- `title/name`
- `summary`
- `publishedAt`
- `updatedAt`
- public media
- public relationships

Never expose internal notes, private sources, staff contacts, permissions, audit or commercial financial fields.

## Home service

Conceptual:
`getHomeFeed({ campusContext, locale?, preview? })`

Returns editorial modules:
- breaking;
- lead;
- latest;
- campusSpotlight;
- opportunities;
- watch;
- events;
- shorts;
- trending;
- partnerModules.

Home is an editorial composition, not one flat list.

## Latest service

`getLatest({ campus?, topic?, cursor?, limit? })`

Returns:
- mixed public editorial feed;
- pagination cursor;
- normalized content-type discriminator.

## Article service

`getArticleBySlug(slug)`

Public:
- headline;
- standfirst;
- body;
- authors;
- public campus/topic;
- hero;
- publication metadata;
- Correction;
- related;
- disclosure.

## Breaking service

`getBreakingBySlug(slug)`

Public:
- headline;
- current update;
- Campus;
- verification language safe for public;
- chronology;
- developing/resolved state;
- related full Article;
- timestamps.

Internal source detail never included.

## Campus services

- `listUniversities()`
- `getCampusBySlug()`
- `getCampusHub({ campus, ... })`

Campus hub returns curated modules rather than requiring client to issue many unrelated fetches.

## Programme/Episode

- `listProgrammes()`
- `getProgrammeBySlug()`
- `getEpisodeBySlug()`

Episode public DTO:
- playback data;
- poster;
- title;
- description;
- guest/host public profiles;
- duration;
- transcript;
- Sponsor disclosure;
- related.

Provider-specific secrets never reach client.

## Opportunities

- `listOpportunities({ type, location, campus, deadlineRange, cursor })`
- `getOpportunityBySlug()`

Server determines active/expired state.

Do not trust browser clock as source of truth for active status.

## Events

- `listEvents({ campus, range, type, cursor })`
- `getEventBySlug()`

Server computes:
- upcoming;
- happening;
- completed;
- postponed;
- cancelled.

## Vendors

- `listVendors({ campus, category, query, cursor })`
- `getVendorBySlug()`

Public:
- business;
- category;
- public contact actions;
- hours;
- public location;
- featured/sponsored label.

## Search

SearchAdapter logical API:

```ts
interface SearchAdapter {
  search(input: SearchInput): Promise<SearchResponse>
  index(document: SearchDocument): Promise<void>
  remove(type: SearchEntityType, id: string): Promise<void>
  health(): Promise<SearchHealth>
}
```

`SearchInput`:
- query;
- contentTypes?;
- campus?;
- topic?;
- dateRange?;
- pagination/cursor.

Response:
- grouped/typed results;
- counts;
- suggestions if supported;
- provider-neutral metadata.

## Video

```ts
interface VideoAdapter {
  createUpload(input: CreateVideoUploadInput): Promise<UploadTarget>
  getAsset(id: string): Promise<VideoAssetState>
  getPlayback(id: string): Promise<PlaybackInfo>
  deleteAsset?(id: string): Promise<void>
  health(): Promise<VideoHealth>
}
```

Domain code stores provider-neutral asset identifiers/state.

## Analytics

```ts
interface AnalyticsAdapter {
  track(event: AnalyticsEvent): Promise<void> | void
}
```

Do not put PII in events unless intentionally approved.

## Health

Control may aggregate:
- web;
- Payload;
- DB;
- Search;
- Storage;
- Video;
- Jobs.

Health DTO:
- status: healthy | degraded | unavailable
- checkedAt
- summary
- safe operational metadata

Do not expose secrets/stack traces to ordinary management roles.

## Mutations

All internal mutations:
- authenticated;
- validated;
- authorized;
- audited where significant.

Examples:
- submitBreaking
- requestChanges
- publishBreaking
- publishArticle
- issueCorrection
- retryJob
- approveVendor
- updateCampaignDeliverable

## Error contract

Normalize:
- VALIDATION_ERROR
- UNAUTHENTICATED
- FORBIDDEN
- NOT_FOUND
- CONFLICT
- DEPENDENCY_UNAVAILABLE
- INTERNAL_ERROR

Public UI should map these to useful UX, not raw server messages.

## Pagination

Prefer cursor pagination for high-growth feeds when practical.

Do not fetch all Articles/Vendors/Events into the browser.

## Preview

Payload preview/draft access:
- internal auth only;
- no accidental indexing;
- clear preview mode;
- preview data does not leak to normal public cache.

## Webhooks/callbacks

External video/search/storage callbacks:
- authenticate/verify signatures where supported;
- idempotent;
- log provider event id;
- safe retry;
- never trust callback payload without validation.
