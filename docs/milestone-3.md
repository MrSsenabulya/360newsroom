# Milestone 3 — Public Information Product

## Implemented

### Shell
- Shared `PublicChrome` (desktop nav + mobile bottom nav)
- Site-wide Breaking banner
- Campus selector persisted via cookie + localStorage (`c360_campus`)
- Home/Latest prioritize selected campus without hiding network content

### Search
- `@campus360/search` with `SearchAdapter`
- Postgres live-query adapter (provider TBD — Meilisearch/Typesense later)
- `/search` UI with All / News / Watch / Campus filters
- Failure degrades without taking down the rest of the site

### Sharing
- Share / WhatsApp / Copy link on Article, Breaking, Episode

### SEO
- Root metadata + Open Graph defaults
- Per-page `generateMetadata` for Article, Breaking, Campus, Programme, Episode
- `sitemap.xml` and `robots.txt`
- Custom 404

### Already from M1 (kept)
- Home, Latest, Campus directory/hub, Watch, Programme, Episode

## Exit

Core student journeys work without login: know what’s happening, open campus context, watch a programme, search, share a link.

## Next

Milestone 4 — Opportunities, Events, temporal jobs, Campus Guide.
