# Campus 360 — Information Architecture

## Navigation strategy

Use four layers:

1. **Primary navigation** — highest-frequency student needs.
2. **Campus context** — university/campus relevance.
3. **Utility navigation** — Search, account later, notifications later.
4. **Secondary discovery** — Podcasts, Campus Guide, Topics, Merch, business links.

## Desktop primary navigation

Recommended:
- Latest
- Campus
- Watch
- Opportunities
- Events
- Explore

Campus 360 logo acts as Home.

Utility:
- Search
- Campus selector
- Account later

Do not place these in primary nav by default:
- 360 News
- 360 Hotseat
- Podcasts
- Sports
- Culture
- Quickies
- Campus Guide
- Merch
- About
- Advertise
- 360 Studio
- Contact

Primary navigation represents student needs, not the company org chart.

## Mobile primary navigation

Bottom navigation:
- Home
- Latest
- Campus
- Watch
- Search

Expose Opportunities, Events and Campus Guide prominently through Home/Explore.

## Campus hierarchy

Canonical:
Country → University → Campus

V1:
- Uganda first.

Public UX normally selects University first. If an institution has multiple campuses, default to all campuses under the institution until the user narrows.

Campus context is a cross-product relevance dimension.

If Makerere is selected:
- Home prioritizes Makerere;
- Events prioritize Makerere;
- Campus Guide defaults to Makerere;
- Search may rank Makerere relevance higher;
- Opportunities may prioritize relevant items;
- user can always switch to All Campuses.

## Campus page

Example: `/campus/makerere`

Suggested modules:
- identity/overview;
- top story;
- happening now;
- latest;
- events;
- opportunities;
- watch;
- trending;
- Campus Guide;
- selected Topics.

Do not create separate subdomains per university in V1.

## Programmes

### 360 News
Journalism appears through Latest/campus/topic surfaces.
The produced show lives:
Watch → Programmes → 360 News.

### 360 Hotseat
Watch → Programmes → 360 Hotseat.

Programme page:
- identity;
- description;
- latest Episode;
- archive;
- Shorts;
- related Articles;
- sponsor relationship where applicable.

## Podcasts

Not primary-nav in V1.

Discover through:
- Explore → Podcasts;
- Search;
- Home;
- related content.

Promote later if usage proves it deserves primary status.

## Quickies

Retire as a major architecture section.

Short-form survives as a format, preferably **360 Shorts**.

Shorts can appear:
- Home;
- Watch;
- Programme;
- Event;
- Article;
- Campus;
- Search.

## Campus Guide

Public language: **Campus Guide**.
Internal language: Vendor Operations.

Entry points:
- Campus;
- Explore;
- Search.

Structure:
Campus Guide → Campus → Category → Vendor.

Possible categories:
- Food
- Hostels
- Printing
- Beauty
- Fashion
- Photography
- Electronics
- Transport
- Fitness
- Financial Services
- Other Services

## Topic architecture

Keep distinct:
- **Format** — Article, Video, Podcast, Event, etc.
- **Topic** — Sports, Culture, Careers, Technology, Student Life, Campus Politics, etc.
- **Location** — University/Campus.
- **Programme** — Hotseat, 360 News, etc.

Topic hubs can aggregate mixed formats.

## Search

Search is a major product.

Index:
- Articles
- BreakingUpdates
- Universities
- Campuses
- Programmes
- Episodes
- Opportunities
- Events
- Vendors

Entity-aware behavior:
- “Makerere” → Campus/University first.
- “Hotseat” → Programme first.
- “internships” → open Opportunities first.
- event-like query → upcoming Event first.

States:
- empty;
- typing/suggestions;
- results;
- filtered;
- no result;
- unavailable.

Track:
- query;
- result count;
- selected result;
- no-result query.

No-result data feeds editorial/product strategy.

## Public sitemap

```text
/
├── latest
├── campus
│   ├── universities
│   └── :campusSlug
│       ├── overview
│       ├── latest
│       ├── events
│       ├── opportunities
│       ├── watch
│       └── guide
├── watch
│   ├── programmes
│   │   └── :programmeSlug
│   │       └── :episodeSlug
│   ├── shorts
│   ├── films
│   └── docs
├── opportunities
│   └── :slug
├── events
│   └── :slug
├── podcasts
│   ├── :seriesSlug
│   └── :seriesSlug/:episodeSlug
├── campus-guide
│   ├── :campusSlug
│   └── :campusSlug/:vendorSlug
├── topics
│   └── :topicSlug
├── search
├── news
│   └── :slug
├── breaking
│   └── :slug
├── business
│   ├── advertise
│   ├── partnerships
│   ├── 360-studio
│   ├── vendor-listings
│   ├── post-opportunity
│   ├── promote-event
│   ├── audience
│   └── contact
├── about
├── contributors
├── join
├── submit-tip
├── contact
├── editorial-standards
├── corrections-policy
├── advertising-policy
├── privacy
└── terms
```

Exact route naming may change; hierarchy and entity rules should not.

## Content discovery mechanisms

Students discover through:
- editorial curation;
- recency;
- campus;
- topic;
- programme/format;
- Search.

Later:
- personalization;
- following;
- notifications.

## Business-facing IA

Keep commercial navigation outside primary student navigation.

Business hub:
- Advertise with Campus 360
- Partnerships
- 360 Studio
- Vendor Listings
- Post an Opportunity
- Promote an Event
- Audience & Reach
- Contact Commercial

## Stable URL principle

Every core content entity has a stable, shareable direct URL.

A WhatsApp share should never send someone to Home and expect them to rediscover the content.
