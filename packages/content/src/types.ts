export type PublicCampusRef = {
  name: string;
  slug: string;
  universityName: string;
  universitySlug: string;
};

export type PublicTopicRef = {
  name: string;
  slug: string;
};

export type PublicPersonRef = {
  name: string;
  slug: string;
};

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  standfirst: string | null;
  body: string;
  articleType: string;
  firstPublishedAt: string | null;
  lastPublishedAt: string | null;
  campuses: PublicCampusRef[];
  topics: PublicTopicRef[];
  authors: PublicPersonRef[];
  universityName: string | null;
  heroUrl: string | null;
  heroAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type PublicArticleCard = {
  id: string;
  title: string;
  slug: string;
  standfirst: string | null;
  articleType: string;
  firstPublishedAt: string | null;
  campuses: PublicCampusRef[];
  heroUrl: string | null;
  heroAlt: string | null;
  /** Estimated reading time; derived from body server-side (body never exposed on cards). */
  readMinutes: number;
};

export type PublicBreaking = {
  id: string;
  headline: string;
  slug: string;
  shortUpdate: string;
  developmentState: string;
  sourceContext: string | null;
  firstPublishedAt: string | null;
  lastPublishedAt: string | null;
  campus: PublicCampusRef | null;
  topic: PublicTopicRef | null;
  relatedArticleSlug: string | null;
  timeline: Array<{ id: string; body: string; occurredAt: string }>;
};

export type PublicCampusHub = {
  name: string;
  slug: string;
  description: string | null;
  locationLabel: string | null;
  universityName: string;
  universitySlug: string;
  latestArticles: PublicArticleCard[];
  activeBreaking: PublicBreakingCard[];
  upcomingEvents: PublicEventCard[];
  activeOpportunities: PublicOpportunityCard[];
  guideVendors: PublicVendorCard[];
};

export type PublicBreakingCard = {
  id: string;
  headline: string;
  slug: string;
  shortUpdate: string;
  developmentState: string;
  firstPublishedAt: string | null;
  campusSlug: string | null;
  campusName: string | null;
};

export type PublicProgramme = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programmeType: string;
  coverUrl: string | null;
  episodes: PublicEpisodeCard[];
};

export type PublicEpisodeCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  episodeNumber: number | null;
  publishedAt: string | null;
  durationSec: number | null;
};

export type PublicEpisode = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  episodeNumber: number | null;
  durationSec: number | null;
  videoUrl: string | null;
  transcript: string | null;
  publishedAt: string | null;
  programme: { name: string; slug: string };
  hosts: PublicPersonRef[];
  guests: PublicPersonRef[];
  campuses: PublicCampusRef[];
  thumbnailUrl: string | null;
};

export type PublicOpportunityCard = {
  id: string;
  title: string;
  slug: string;
  opportunityType: string;
  listingStatus: string;
  location: string | null;
  workMode: string;
  deadline: string | null;
  organisationName: string | null;
  applicationsClosed: boolean;
};

export type PublicOpportunity = PublicOpportunityCard & {
  description: string;
  eligibility: string | null;
  compensation: string | null;
  applicationUrl: string | null;
  contactPublic: string | null;
  sourceLabel: string | null;
  publishedAt: string | null;
  campuses: PublicCampusRef[];
};

export type PublicEventCard = {
  id: string;
  name: string;
  slug: string;
  eventType: string;
  lifecycleStatus: string;
  startAt: string;
  endAt: string | null;
  venue: string | null;
  campusName: string | null;
  campusSlug: string | null;
};

export type PublicEvent = PublicEventCard & {
  description: string;
  ticketUrl: string | null;
  priceLabel: string | null;
  contactPublic: string | null;
  organisationName: string | null;
  universityName: string | null;
  posterUrl: string | null;
};

export type PublicVendorCard = {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  categoryName: string | null;
  categorySlug: string | null;
  featured: boolean;
  verified: boolean;
  priceRange: string | null;
  campuses: PublicCampusRef[];
};

export type PublicVendor = PublicVendorCard & {
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  openingHours: string | null;
  logoUrl: string | null;
};

export type PublicTopicHub = {
  name: string;
  slug: string;
  description: string | null;
  articles: PublicArticleCard[];
  collection: {
    title: string;
    slug: string;
    items: Array<{ title: string; urlPath: string; entityType: string }>;
  } | null;
};

export type PublicCollection = {
  title: string;
  slug: string;
  description: string | null;
  items: Array<{ title: string; urlPath: string; entityType: string }>;
};
