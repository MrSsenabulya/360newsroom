# Milestone 4 — Utility

## Implemented

### Schema (`packages/db`)
- **Opportunity** (+ campus links, listing/expiration)
- **Event** (lifecycle: Upcoming / Happening Now / Completed / …)
- **Vendor** + **VendorCategory** (public: Campus Guide)
- **Collection** + **CollectionItem** (topic hubs / curated mixes)
- **SystemJobRun** for temporal job visibility

### Public web
- `/opportunities` + detail (expired stays on direct URL, “Applications closed”)
- `/events` + detail (upcoming / week / past)
- `/guide` + vendor detail (WhatsApp / Call / Website — no checkout)
- `/topics` + topic hubs; `/collections/[slug]`
- Home + Campus hub surfaces Opportunities, Events, Guide
- Search filters for Opportunities / Events / Guide
- Sitemap entries for utility entities

### Newsroom
- `/opportunities`, `/events`, `/guide` create + publish/approve
- `/jobs` — run utility tick (expire opportunities, refresh events, banner expiry, vendor listing end, scheduled article publish)

### Content packages
- `@campus360/content/utility`
- `@campus360/content/jobs`

### Intentionally light / deferred
- Podcasts (“if ready”) — skip for M4
- Cron wiring — manual tick now; automate in M6
- Full commercial packages/pricing for Guide — M5

## Exit

Platform clearly exceeds “online TV”: students can find openings, events and campus services without logging in.

## Next

Milestone 5 — Commercial & Control (sponsors, campaigns, people/access, health dashboards).
