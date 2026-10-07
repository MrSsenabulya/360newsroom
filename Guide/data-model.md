# Campus 360 — Conceptual Data Model

This is the conceptual model. Payload schemas, SQL migrations and indexes come during implementation.

## Domain groups

1. Geography & Institutions
2. Editorial
3. Media & Programmes
4. Utility
5. People & Organisations
6. Commercial
7. Newsroom Operations
8. System

---

## Geography & Institutions

### Country
Fields:
- id
- name
- code
- slug
- currency
- timezone
- status

V1: Uganda.

### University
- id
- name
- slug
- shortName
- logo
- website
- country
- description
- status

### Campus
- id
- name
- slug
- university
- locationLabel
- address where appropriate
- coordinates where appropriate
- image
- description
- status

Relationship:
Country → University → Campus.

---

## Editorial

### Article

Fields:
- id
- title
- slug
- standfirst/summary
- body
- articleType
- heroMedia
- authors[]
- editor
- university
- campus/campuses
- topics[]
- tags[]
- peopleMentioned[]
- relatedEvent
- relatedProgramme
- relatedContent[]
- sponsor/campaign where applicable
- workflowStatus
- publicationStatus
- verificationStatus
- editorialRisk
- visibility
- createdAt
- updatedAt
- eventOccurredAt
- firstPublishedAt
- lastPublishedAt
- scheduledAt
- archivedAt
- SEO metadata
- social metadata

Article types:
- News
- Feature
- Opinion
- Interview
- Explainer
- Review
- Announcement

### BreakingUpdate

- id
- headline
- slug
- shortUpdate/body
- campus
- university
- topic
- reporter
- sources
- verificationStatus
- developmentState
- priority
- breakingBannerEnabled
- campusVisibility
- relatedArticle
- firstPublishedAt
- lastPublishedAt
- resolvedAt
- expiresAt
- timeline entries
- activity relations

Development states:
- submitted
- verification
- developing
- resolved
- converted
- archived

### Topic

Examples:
- Campus Politics
- Careers
- Education
- Sports
- Entertainment
- Technology
- Student Life
- Culture
- Fashion
- Business
- Relationships
- Music
- Health
- Innovation

### Tag
Narrow flexible labels. Avoid category explosion.

### Collection

Curated mixed-content hub.

Examples:
- Makerere Graduation 2027
- Guild Election 2027
- Fresher Week

Can relate to:
- Articles
- Breaking Updates
- Events
- Episodes
- Shorts
- Media
- People

### Correction

- content reference
- reportedBy
- issue
- previousInformation
- correctedInformation
- reason
- severity
- approvedBy
- correctedAt
- publicCorrectionNote

Severity:
- Minor
- Material
- Major

---

## Media & Programmes

### Programme

- name
- slug
- programmeType
- description
- logo/cover
- defaultHost(s)
- topics
- status
- defaultReleaseSchedule
- defaultSponsor
- theme metadata
- SEO

### Season
Optional.

### Episode

- programme
- season
- episodeNumber
- workingTitle
- finalTitle
- slug
- description
- thumbnail
- videoAsset
- audioAsset optional
- transcript
- guests[]
- hosts[]
- university/campuses
- topics[]
- duration
- productionStatus
- publicationStatus
- publishedAt
- sponsor
- relatedArticles[]
- relatedShorts[]
- relatedPeople[]

Production states:
- planned
- guestConfirmed
- production
- editing
- editorialReview
- ready
- scheduled
- published
- derivatives

### Short

- title
- slug
- video
- caption
- creator
- university/campus
- topics
- relatedEpisode
- relatedArticle
- relatedEvent
- duration
- publishedAt

### Film / Documentary

- title
- slug
- synopsis
- director
- cast/crew
- poster
- trailer
- fullVideo
- duration
- releaseDate
- contentGuidance
- sponsor
- topics
- credits

Documentary series may be Programme + Episodes.

### PodcastSeries

- title
- slug
- description
- hosts
- cover
- topics
- status

### PodcastEpisode

- title
- series
- slug
- audio
- guests
- showNotes
- transcript
- duration
- publishedAt
- relatedContent
- sponsor

### MediaAsset

- file/providerId
- type
- size
- duration
- dimensions
- altText
- caption
- credit
- copyrightOwner
- source
- uploadedAt
- uploadedBy
- usageRights
- campus
- relatedPeople
- relatedEvent
- restrictions

Rights:
- Owned by Campus 360
- Licensed
- Third-party provided
- Press/Public material
- Restricted
- Unknown

Renditions:
- 16:9
- 3:2
- 4:5
- 1:1
- 9:16
- thumbnails

---

## Utility

### Event

- name
- slug
- description
- eventType
- university
- campus
- venue
- startAt
- endAt
- organizer
- poster
- ticketUrl
- price
- contact
- sponsor
- status
- relatedContent[]

Types:
- Entertainment
- Academic
- Career
- Sports
- University
- Religious
- Cultural
- Club
- Campus 360

Status:
- Upcoming
- HappeningNow
- Postponed
- Cancelled
- Completed

Events persist after occurrence.

### Opportunity

- title
- slug
- organisation
- type
- description
- eligibility
- applicable universities/campuses
- location
- workMode
- compensation
- deadline
- applicationUrl
- contact
- source
- verificationStatus
- publishedAt
- expiresAt
- sponsor/featured
- active status

Types:
- Internship
- Graduate Job
- Job
- Scholarship
- Fellowship
- Competition
- Grant
- Campus Ambassador
- Volunteer
- Call for Applications

Deadline is structured. Expiration is automatic.

### Vendor

Public concept: Campus Guide listing.

- businessName
- slug
- description
- logo
- images
- category
- campuses served
- address
- coordinates
- phone
- WhatsApp
- Instagram
- website
- openingHours
- priceRange
- verified
- featured
- sponsor/campaign
- listingStatus
- package
- listingStart
- listingEnd

### VendorCategory

Examples:
- Food
- Hostels
- Printing
- Fashion
- Beauty
- Photography
- Electronics
- Transport
- Gyms
- Financial Services
- Entertainment
- Other Services

### MerchProduct

Simple V1:
- name
- slug
- images
- description
- price
- sizes/options
- availability
- orderUrl/WhatsApp

Full cart/order/payment later.

---

## People & Organisations

### Person

- name
- slug
- bio
- photo
- occupation
- university affiliation
- socials
- relatedContent

### Contributor

- person/user relationship
- name
- photo
- bio
- role
- assignedUniversity
- assignedCampuses[]
- expertise
- contact
- socials
- account
- status
- relatedContent

Roles can include:
- journalist
- correspondent
- editor
- photographer
- presenter
- videographer
- podcast host
- columnist

### UserAccount

Authentication identity.

Keep public audience account concept separate from editorial Contributor identity.

### Organisation

- name
- slug
- type
- website
- logo
- contacts

Types:
- company
- NGO
- employer
- university department
- student organization
- sponsor
- event organizer

---

## Commercial

### Sponsor

- organisation
- commercial contacts
- status
- notes
- relationship history

### Campaign

- name
- sponsor
- owner
- objectives
- startAt
- endAt
- contractValue/budget reference
- targetUniversities
- targetCampuses
- targetAudience
- status
- deliverables
- placements
- creativeAssets
- notes
- files/contracts

Status:
- Lead
- Proposal
- Contracted
- Setup
- Scheduled
- Live
- Paused
- Completed
- Reported
- Renewal
- Cancelled

### CampaignDeliverable

- campaign
- deliverableType
- title
- dueAt
- owner
- status
- relatedEditorialContent
- relatedPlacement
- notes

### Placement

Types:
- Programme Sponsor
- Homepage Sponsored Feature
- Campus Page Sponsor
- Opportunity Sponsor
- Event Sponsor
- Article Sponsor
- Video Sponsor
- Newsletter Sponsor
- Vendor Feature

Fields:
- campaign
- type
- startAt
- endAt
- creative
- targetCampuses
- status
- exclusivity/category if relevant

### CommercialEnquiry / Lead

- organisation
- contact
- interest
- campuses
- budgetRange
- message
- source
- assignedOwner
- status
- nextFollowUp
- notes
- files

Pipeline:
- New
- Contacted
- Qualified
- Proposal
- Negotiation
- Won
- Lost
- Follow-up

### StudioProject

P2/later.

- client
- projectName
- serviceType
- brief
- projectLead
- productionTeam
- budget
- deadline
- status
- deliverables
- files
- paymentStatusReference

---

## Newsroom Operations

### StoryIdea

- workingTitle
- pitch
- suggestedBy
- campus
- university
- topics
- potentialSources
- whyItMatters
- suggestedFormat
- urgency
- submittedAt
- status
- editorialNotes

Status:
- New
- Discussing
- Approved
- Rejected
- On Hold
- Converted to Assignment

### EditorialAssignment

- workingTitle
- brief
- assignedReporters[]
- editor
- campus
- university
- topics
- storyType
- priority
- deadline
- targetPublishAt
- expectedFormat
- requiredDeliverables
- relatedEvent
- commercialObligation
- status

States:
- Assigned
- Accepted
- Reporting
- Submitted
- Completed
- Cancelled

### EditorialActivity

- actor
- contentType
- contentId
- action
- previousStatus
- newStatus
- comment
- timestamp

---

## Workflow metadata

Keep separate.

### Workflow
- Draft
- In Review
- Changes Requested
- Verification
- Ready
- Scheduled
- Published
- Archived

### Verification
- Unverified
- Verification in progress
- Partially verified
- Verified
- Official confirmation
- Disputed

### Editorial risk
- Normal
- Elevated
- High

### Visibility
- Public
- Unlisted
- Internal
- Embargoed
- Members-only later if ever needed

### Priority
- Normal
- High
- Breaking
- Critical

## Time fields

Where relevant:
- createdAt
- updatedAt
- eventOccurredAt
- submittedAt
- firstPublishedAt
- lastPublishedAt
- scheduledAt
- expiresAt
- archivedAt

These support newsroom speed analytics.

## SEO/social metadata

Where relevant:
- SEO title
- SEO description
- canonical URL
- Open Graph image
- social headline
- WhatsApp description
- social renditions
- index/noindex

## Relationship examples

University → Campus → Article/Event/Opportunity/Vendor.

Programme → Episode → Guest/Topic/Campus/Sponsor/Short/Article.

Organisation → Opportunity and/or Sponsor → Campaign → Placement.

Event → Article/Video/Photo/Programme Episode/Sponsor.

BreakingUpdate → Article.

Episode → derivative Shorts + related Articles.

One MediaAsset can be reused.

## Explicitly not modeled for V1

- full marketplace;
- vendor inventory/stock;
- third-party cart;
- student DMs;
- follower graph;
- student groups;
- gamification;
- creator monetization;
- complex AI recommendations;
- native-app-only systems;
- advanced billing/accounting.
