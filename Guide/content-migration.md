# Campus 360 — Content Migration Plan

## Objective

The new platform is an opportunity to clean content, not blindly reproduce historical clutter.

## Inventory sources

Possible old content sources:
- old website/database;
- YouTube;
- social platforms;
- drive folders;
- Figma/static content;
- programme archives;
- podcast feeds;
- event records.

## Classification

### Migrate
Evergreen/current/high-value content.

### Selective archive
Historically relevant content worth preserving.

### Omit
- duplicate;
- broken;
- low-quality;
- test/demo;
- obsolete.

### Do not activate
Outdated utility content:
- expired Opportunities;
- past Events without archival value;
- old vendor details that cannot be verified.

## Mapping

Old “Shows” → Programme.

Old videos → Episode/Short/Film based on actual format.

Old Quickies → Short where worth keeping.

Podcasts → PodcastSeries + PodcastEpisode.

News posts → Article.

Announcements that are actually Events/Opportunities should be normalized into structured entity if still relevant.

## Media

Before migration:
- validate file;
- identify rights;
- credit;
- alt/caption;
- map to entity;
- generate/attach renditions where needed.

Unknown rights should not silently become “owned”.

## Slugs and redirects

Build a redirect map:
- old URL;
- new canonical URL;
- redirect status.

Avoid breaking shared/indexed links when possible.

## Duplicate handling

Use:
- source id;
- slug;
- media fingerprint where practical;
- manual review for ambiguous duplicates.

Migration scripts should be idempotent.

## Programme migration

For each Programme:
- define canonical Programme record;
- map Episodes;
- preserve release dates;
- map hosts/guests where possible;
- identify derivatives;
- assign Programme artwork.

## Editorial timestamps

Preserve original publish date if trustworthy.

Do not replace history with migration date.

## Old Events

If historically useful:
- migrate as Completed;
- attach coverage.

If low-value:
- omit.

## Old Opportunities

Generally do not migrate as active.

If archived for history:
- mark closed/expired.

## Verification

Old News should not be re-labeled “Verified” merely because it existed previously.

Keep legacy verification state neutral unless reviewed.

## Migration QA

Check:
- broken relations;
- missing media;
- duplicate slugs;
- malformed rich text;
- invalid dates;
- incorrect active states;
- redirects;
- Programme ordering.

## Cutover

Before launch:
- freeze old content edits if needed;
- run final delta import;
- validate counts;
- validate top URLs;
- update sitemap;
- monitor 404s after launch.
