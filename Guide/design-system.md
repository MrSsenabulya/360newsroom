# Campus 360 — Visual Product Strategy & Design System

## Visual positioning

Campus 360 sits between:
- credible journalism;
- youth culture;
- broadcast media;
- student utility.

Desired idea:

> **Editorial confidence with cultural energy.**

The interface should feel:
- current;
- credible;
- youth-native;
- bold;
- local;
- useful.

## Anti-goals

Do not make it look like:

### Netflix
- no endless streaming rows;
- no video-only hierarchy;
- no black entertainment shell dominating everything.

### YouTube
- no generic creator-channel architecture.

### Complex clone
Borrow editorial confidence, cultural storytelling, programme identity and scale. Do not copy US-specific structure or visual language wholesale.

### Generic news portal
- no banner-ad wasteland;
- no giant category clutter;
- no permanent screaming ticker.

### University website
- no committee/institutional aesthetic.

### AI SaaS dashboard
Especially internal:
- no endless identical rounded cards;
- no glassmorphism;
- no generic icon bubbles;
- no meaningless gradient blobs;
- no decorative metrics.

## Core visual concept — The Campus Signal

Campus 360 is constantly picking up:
- breaking developments;
- culture;
- events;
- Opportunities;
- personalities;
- Programmes;
- conversations.

Possible recurring devices:
- timestamps;
- location labels;
- update markers;
- editorial numbering;
- section rules;
- Campus identifiers;
- live/developing indicators.

Do not turn “360” into a circle/orbit gimmick.

## Interface intensity

### Public — expressive
- editorial typography;
- photography;
- Programme art;
- stronger brand accent.

### Newsroom — focused
- neutral surfaces;
- compact density;
- semantic urgency.

### Control — analytical
- tables;
- rules;
- restrained charts;
- exception-oriented layout.

Same DNA, different intensity.

## Colour

Final brand colors should be reconciled with approved identity.

Provisional roles:

### Neutrals
- Ink 1000 `#101114`
- Ink 900 `#181A1F`
- Slate 700 `#42464F`
- Slate 500 `#70757F`
- Slate 300 `#C4C7CD`
- Slate 200 `#DFE1E5`
- Paper `#F7F5F0`
- Surface `#FFFFFF`

### Brand
- Signal 600 provisional `#2455FF`
- Pulse 500 provisional `#FFD84D`

### Semantic
- Critical `#D92D20`
- Warning `#D97706`
- Success `#16803C`
- Info `#2563EB`

Semantic colors are not Sponsor colors.

## Semantic tokens

Prefer:
- bg.page
- bg.surface
- bg.subtle
- bg.inverse
- text.primary
- text.secondary
- text.muted
- text.inverse
- border.default
- border.subtle
- border.strong
- action.primary
- status.critical
- status.warning
- status.success

Components should reference semantic roles where possible.

## Typography

Direction:
- strong primary sans;
- optional editorial serif.

Provisional testing:
- Archivo Variable
- Source Serif 4

Do not lock before brand review.

### Type roles
- Display
- Hero
- H1
- H2
- H3
- Story
- Compact Story
- Body Large
- Body
- UI Body
- Metadata

Responsive starting scale:
- Display: 56–72 desktop, 40–48 mobile
- Hero: 40–56 desktop, 32–40 mobile
- H1: 36–48 desktop, 28–34 mobile
- H2: 28–36
- H3: 22–28
- Story: 18–24
- Body Large: 18–20
- Body: 16–18
- UI: 14–16
- Metadata: 12–14

Long-form width:
~640–760px.

Body line-height:
~1.55–1.7 depending on type.

## Grid

### Mobile
- 4 columns
- 16px margins
- 12px gutters

### Tablet
- 8 columns
- 24px margins
- 16px gutters

### Desktop
- 12 columns
- 32–48px margins
- 24px gutters

### Wide
- max canvas ~1440–1520px

Use editorial asymmetry. Not every story gets equal geometry.

## Spacing

4px base:
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64
- 80
- 96

## Radius

Sharper editorial language:
- 0 — full bleed
- 4 — subtle container
- 8 — interactive card
- 12 — limited prominent module
- 999 — pills/chips only

Avoid huge corner radii everywhere.

## Elevation

Prefer:
1. space;
2. typography;
3. rules;
4. borders;
5. surface contrast.

Shadows primarily for:
- popovers;
- dialogs;
- floating nav;
- temporary elevation.

## Signature editorial devices

Possible:
- section title + strong rule;
- Campus/topic kicker;
- ranked numbers;
- time/location treatment;
- developing marker.

Examples:
- `MAKERERE / LATEST`
- `LATEST ━━━━━━━━━ 12:48`
- `01 Guild Election Results`

## Photography

Prefer:
- real students;
- real campuses;
- actual events;
- contributor photography;
- programme stills;
- documentary imagery.

Avoid generic stock youth imagery.

Treatment:
- natural;
- credible;
- strong skin-tone accuracy;
- context-appropriate grading.

Breaking should not look like a fashion campaign.

## Image ratios

- 16:9 — video/lead
- 3:2 — documentary/editorial
- 4:5 — profile/culture
- 1:1 — compact profile/category
- 9:16 — Shorts
- original — Article media when justified

## Programme themes

Programmes may override:
- accent;
- art direction;
- hero treatment;
- motion sting;
- title treatment.

They inherit:
- spacing;
- navigation;
- controls;
- accessibility;
- core type system.

### 360 News
- authoritative;
- fast;
- high contrast;
- red only for genuine Breaking.

### 360 Hotseat
- personality-led;
- intimate;
- bold portraiture;
- guest name;
- quotes;
- strong controlled accent.

### Films & Docs
- cinematic;
- large imagery;
- minimal surrounding UI;
- credits/synopsis.

## Utility tones

### Opportunities
Structured, practical, deadline prominent.

### Events
Expressive but date/time/location remain obvious.

### Campus Guide
Curated utility, not classifieds/e-commerce.

## Motion

- Fast 120ms
- Standard 180ms
- Slow 260ms
- Feature ~400ms max

Use:
- fade;
- slide;
- subtle scale.

Avoid:
- bouncing;
- unnecessary parallax;
- slow page transitions.

Respect reduced motion.

## Density

Tokens:
- comfortable
- standard
- compact

Public mostly comfortable.
Newsroom standard/compact.
Control standard/compact.

## Shared primitives

- Button
- IconButton
- Link
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- Tabs
- Chip
- Status/Badge
- Tooltip
- Popover
- Dialog
- Sheet
- Toast
- Alert
- Skeleton
- Pagination

## Public editorial components

- Story/Hero
- Story/Lead
- Story/Horizontal
- Story/Compact
- Story/TextOnly
- Story/Ranked
- Story/Breaking
- Breaking/Banner
- Breaking/Timeline
- CorrectionNotice
- RelatedContent

Do not create one universal Card for every use case.

## Media components

- Programme/Hero
- Programme/Card
- Episode/Featured
- Episode/Horizontal
- Episode/Compact
- Short/Portrait
- VideoPlayer
- AudioPlayer
- Chapter
- GuestProfile

## Utility components

- Opportunity/Card
- Opportunity/Compact
- Opportunity/Closed
- Event/Card
- Event/DateRow
- Event/HappeningNow
- Event/Cancelled
- Vendor/Card
- Vendor/Featured
- Vendor/ActionRow
- DeadlineIndicator

## Search components

- SearchField
- SearchSuggestion
- EntityResult
- SearchGroup
- SearchFilters
- SearchEmpty
- SearchError

## Newsroom components

- AssignmentRow
- BreakingSubmission
- ReviewRow
- VerificationStatus
- PriorityMarker
- SourceRecord
- EditorialComment
- WorkflowStep
- VersionEntry
- CalendarEvent
- MediaAsset
- EditorialActionBar

## Control components

- Metric
- HealthStatus
- AlertRail
- OperationalTable
- CampaignDelivery
- Trend
- PlatformStatus
- AuditRow

## Buttons

Hierarchy:
- Primary
- Secondary
- Tertiary
- Destructive
- Icon-only where understood

One dominant primary action per local context.

Examples:
- Apply Now
- Get Tickets
- WhatsApp
- Play Episode
- Publish when valid

## Chips vs labels

Interactive filter/context = chip.
Static metadata = kicker/label.

Do not make all metadata appear clickable.

## Navigation

### Desktop public
- Latest
- Campus
- Watch
- Opportunities
- Events
- Explore
- Search
- Campus selector

### Mobile
- Home
- Latest
- Campus
- Watch
- Search

### Newsroom
- Desk
- Breaking
- Review
- Calendar
- Publishing
- Programmes
- Media
- Reference

### Control
- Overview
- Audience
- Commercial
- Vendors
- Operations
- People
- Platform
- Reports
- System

## Homepage blocks

- Lead Story
- Breaking Rail
- Latest Stack
- Story Grid
- Campus Spotlight
- Watch Feature
- Opportunity Rail
- Events Row
- Shorts Strip
- Trending List
- Partner Module

### Standard recipe
Lead → Latest → Campus → Opportunities → Watch → Events → Trending.

### Breaking
Breaking → Live Updates → Top Coverage → Latest → Context → Watch.

### Major Event
Event Hero → What You Need to Know → Live/Latest → Watch → Photos → Related.

## Article templates

- Standard News
- Feature
- Opinion
- Interview
- Breaking
- Sponsored

Sponsored variant always discloses relationship.

## Temporal language

Opportunity:
- Closes today
- 2 days left
- Closes Sep 18
- Applications closed

Event:
- Today
- Happening now
- Tomorrow
- Sep 18
- Postponed
- Cancelled
- Ended

Breaking:
- Updated 4 min ago
- Developing
- Confirmed

## State inventory

Every major component considers:
- default;
- loading;
- empty;
- partial;
- error;
- offline;
- expired;
- cancelled;
- developing;
- archived;
- permission denied;
- unverified;
- scheduled;
- processing;
- failed;
- sponsored;
- hidden.

## Accessibility

Target WCAG 2.2 AA.

Requirements:
- keyboard;
- focus;
- ~44x44 comfortable touch targets;
- semantic HTML;
- contrast;
- labels;
- screen-reader names;
- errors not color-only;
- reduced motion;
- captions/transcripts;
- zoom/text resize;
- no essential text only in graphics.

## Sponsored design

Use:
- Sponsored
- Paid Partnership
- Presented by
- Supported by

Sponsor identity never overpowers Campus 360/Programme identity.

No ad before the primary answer on Breaking.

## Naming

Examples:
- `C360/Core/Button/Primary`
- `C360/Public/Story/Hero`
- `C360/Public/Event/Card`
- `C360/Newsroom/Review/Row`
- `C360/Control/Metric/Trend`

Code names should mirror product language.
