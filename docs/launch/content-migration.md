# Content migration checklist

Before importing archive content:

- [ ] Map legacy URLs → Campus 360 routes (`/news/[slug]`, `/breaking/[slug]`, etc.)
- [ ] Preserve publish timestamps where possible
- [ ] Strip private source notes from any import files
- [ ] Generate redirects for high-traffic legacy paths
- [ ] Re-run Search indexing / verify Postgres search finds titles
- [ ] Update sitemap after bulk import
- [ ] Spot-check 20 articles for encoding, media, campus links
- [ ] Monitor 404s for 7 days post-launch

Pilot campus first (e.g. Makerere), then expand.
