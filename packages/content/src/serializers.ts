import type {
  PublicArticle,
  PublicArticleCard,
  PublicBreaking,
  PublicBreakingCard,
  PublicCampusHub,
  PublicCampusRef,
  PublicCollection,
  PublicEpisode,
  PublicEpisodeCard,
  PublicEvent,
  PublicEventCard,
  PublicOpportunity,
  PublicOpportunityCard,
  PublicProgramme,
  PublicTopicHub,
  PublicVendor,
  PublicVendorCard,
} from './types';

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function campusRef(campus: {
  name: string;
  slug: string;
  university: { name: string; slug: string };
}): PublicCampusRef {
  return {
    name: campus.name,
    slug: campus.slug,
    universityName: campus.university.name,
    universitySlug: campus.university.slug,
  };
}

/** ~200 wpm; never expose body on the card DTO. */
export function estimateReadMinutes(body: string | null | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function toPublicArticleCard(article: {
  id: string;
  title: string;
  slug: string;
  standfirst: string | null;
  body?: string | null;
  articleType: string;
  firstPublishedAt: Date | null;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
  heroMedia?: { publicUrl: string | null; altText: string | null } | null;
}): PublicArticleCard {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    standfirst: article.standfirst,
    articleType: article.articleType,
    firstPublishedAt: iso(article.firstPublishedAt),
    campuses: article.campuses.map((row) => campusRef(row.campus)),
    heroUrl: article.heroMedia?.publicUrl ?? null,
    heroAlt: article.heroMedia?.altText ?? null,
    readMinutes: estimateReadMinutes(article.body),
  };
}

export function toPublicArticle(article: {
  id: string;
  title: string;
  slug: string;
  standfirst: string | null;
  body: string;
  articleType: string;
  firstPublishedAt: Date | null;
  lastPublishedAt: Date | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  university: { name: string } | null;
  heroMedia: { publicUrl: string | null; altText: string | null } | null;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
  topics: Array<{ topic: { name: string; slug: string } }>;
  authors: Array<{ person: { name: string; slug: string } }>;
}): PublicArticle {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    standfirst: article.standfirst,
    body: article.body,
    articleType: article.articleType,
    firstPublishedAt: iso(article.firstPublishedAt),
    lastPublishedAt: iso(article.lastPublishedAt),
    campuses: article.campuses.map((row) => campusRef(row.campus)),
    topics: article.topics.map((row) => ({ name: row.topic.name, slug: row.topic.slug })),
    authors: article.authors.map((row) => ({ name: row.person.name, slug: row.person.slug })),
    universityName: article.university?.name ?? null,
    heroUrl: article.heroMedia?.publicUrl ?? null,
    heroAlt: article.heroMedia?.altText ?? null,
    seoTitle: article.seoTitle ?? null,
    seoDescription: article.seoDescription ?? null,
  };
}

export function toPublicBreakingCard(item: {
  id: string;
  headline: string;
  slug: string;
  shortUpdate: string;
  developmentState: string;
  firstPublishedAt: Date | null;
  campus: { name: string; slug: string } | null;
}): PublicBreakingCard {
  return {
    id: item.id,
    headline: item.headline,
    slug: item.slug,
    shortUpdate: item.shortUpdate,
    developmentState: item.developmentState,
    firstPublishedAt: iso(item.firstPublishedAt),
    campusSlug: item.campus?.slug ?? null,
    campusName: item.campus?.name ?? null,
  };
}

export function toPublicBreaking(item: {
  id: string;
  headline: string;
  slug: string;
  shortUpdate: string;
  developmentState: string;
  sourceContext: string | null;
  firstPublishedAt: Date | null;
  lastPublishedAt: Date | null;
  campus: { name: string; slug: string; university: { name: string; slug: string } } | null;
  topic: { name: string; slug: string } | null;
  relatedArticle: { slug: string } | null;
  timeline: Array<{ id: string; body: string; occurredAt: Date }>;
}): PublicBreaking {
  return {
    id: item.id,
    headline: item.headline,
    slug: item.slug,
    shortUpdate: item.shortUpdate,
    developmentState: item.developmentState,
    sourceContext: item.sourceContext,
    firstPublishedAt: iso(item.firstPublishedAt),
    lastPublishedAt: iso(item.lastPublishedAt),
    campus: item.campus ? campusRef(item.campus) : null,
    topic: item.topic ? { name: item.topic.name, slug: item.topic.slug } : null,
    relatedArticleSlug: item.relatedArticle?.slug ?? null,
    timeline: item.timeline.map((entry) => ({
      id: entry.id,
      body: entry.body,
      occurredAt: entry.occurredAt.toISOString(),
    })),
  };
}

export function toPublicCampusHub(input: {
  campus: {
    name: string;
    slug: string;
    description: string | null;
    locationLabel: string | null;
    university: { name: string; slug: string };
  };
  latestArticles: Parameters<typeof toPublicArticleCard>[0][];
  activeBreaking: Parameters<typeof toPublicBreakingCard>[0][];
  upcomingEvents: Parameters<typeof toPublicEventCard>[0][];
  activeOpportunities: Parameters<typeof toPublicOpportunityCard>[0][];
  guideVendors: Parameters<typeof toPublicVendorCard>[0][];
}): PublicCampusHub {
  return {
    name: input.campus.name,
    slug: input.campus.slug,
    description: input.campus.description,
    locationLabel: input.campus.locationLabel,
    universityName: input.campus.university.name,
    universitySlug: input.campus.university.slug,
    latestArticles: input.latestArticles.map(toPublicArticleCard),
    activeBreaking: input.activeBreaking.map(toPublicBreakingCard),
    upcomingEvents: input.upcomingEvents.map(toPublicEventCard),
    activeOpportunities: input.activeOpportunities.map(toPublicOpportunityCard),
    guideVendors: input.guideVendors.map(toPublicVendorCard),
  };
}

export function toPublicOpportunityCard(item: {
  id: string;
  title: string;
  slug: string;
  opportunityType: string;
  listingStatus: string;
  location: string | null;
  workMode: string;
  deadline: Date | null;
  organisation: { name: string } | null;
}): PublicOpportunityCard {
  const closed = item.listingStatus === 'EXPIRED';
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    opportunityType: item.opportunityType,
    listingStatus: item.listingStatus,
    location: item.location,
    workMode: item.workMode,
    deadline: iso(item.deadline),
    organisationName: item.organisation?.name ?? null,
    applicationsClosed: closed,
  };
}

export function toPublicOpportunity(item: {
  id: string;
  title: string;
  slug: string;
  description: string;
  eligibility: string | null;
  location: string | null;
  workMode: string;
  compensation: string | null;
  applicationUrl: string | null;
  contactPublic: string | null;
  sourceLabel: string | null;
  opportunityType: string;
  listingStatus: string;
  deadline: Date | null;
  publishedAt: Date | null;
  organisation: { name: string } | null;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
}): PublicOpportunity {
  return {
    ...toPublicOpportunityCard(item),
    description: item.description,
    eligibility: item.eligibility,
    compensation: item.compensation,
    applicationUrl: item.applicationUrl,
    contactPublic: item.contactPublic,
    sourceLabel: item.sourceLabel,
    publishedAt: iso(item.publishedAt),
    campuses: item.campuses.map((row) => campusRef(row.campus)),
  };
}

export function toPublicEventCard(item: {
  id: string;
  name: string;
  slug: string;
  eventType: string;
  lifecycleStatus: string;
  startAt: Date;
  endAt: Date | null;
  venue: string | null;
  campus: { name: string; slug: string } | null;
}): PublicEventCard {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    eventType: item.eventType,
    lifecycleStatus: item.lifecycleStatus,
    startAt: item.startAt.toISOString(),
    endAt: iso(item.endAt),
    venue: item.venue,
    campusName: item.campus?.name ?? null,
    campusSlug: item.campus?.slug ?? null,
  };
}

export function toPublicEvent(item: {
  id: string;
  name: string;
  slug: string;
  description: string;
  eventType: string;
  lifecycleStatus: string;
  startAt: Date;
  endAt: Date | null;
  venue: string | null;
  ticketUrl: string | null;
  priceLabel: string | null;
  contactPublic: string | null;
  campus: { name: string; slug: string } | null;
  university: { name: string } | null;
  organisation: { name: string } | null;
  poster: { publicUrl: string | null } | null;
}): PublicEvent {
  return {
    ...toPublicEventCard(item),
    description: item.description,
    ticketUrl: item.ticketUrl,
    priceLabel: item.priceLabel,
    contactPublic: item.contactPublic,
    organisationName: item.organisation?.name ?? null,
    universityName: item.university?.name ?? null,
    posterUrl: item.poster?.publicUrl ?? null,
  };
}

export function toPublicVendorCard(item: {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  featured: boolean;
  verified: boolean;
  priceRange: string | null;
  category: { name: string; slug: string } | null;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
}): PublicVendorCard {
  return {
    id: item.id,
    businessName: item.businessName,
    slug: item.slug,
    description: item.description,
    categoryName: item.category?.name ?? null,
    categorySlug: item.category?.slug ?? null,
    featured: item.featured,
    verified: item.verified,
    priceRange: item.priceRange,
    campuses: item.campuses.map((row) => campusRef(row.campus)),
  };
}

export function toPublicVendor(item: {
  id: string;
  businessName: string;
  slug: string;
  description: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  openingHours: string | null;
  featured: boolean;
  verified: boolean;
  priceRange: string | null;
  category: { name: string; slug: string } | null;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
  logo: { publicUrl: string | null } | null;
}): PublicVendor {
  return {
    ...toPublicVendorCard(item),
    address: item.address,
    phone: item.phone,
    whatsapp: item.whatsapp,
    instagram: item.instagram,
    website: item.website,
    openingHours: item.openingHours,
    logoUrl: item.logo?.publicUrl ?? null,
  };
}

export function toPublicTopicHub(input: {
  topic: { name: string; slug: string; description: string | null };
  articles: Parameters<typeof toPublicArticleCard>[0][];
  collection: {
    title: string;
    slug: string;
    items: Array<{ title: string; urlPath: string; entityType: string }>;
  } | null;
}): PublicTopicHub {
  return {
    name: input.topic.name,
    slug: input.topic.slug,
    description: input.topic.description,
    articles: input.articles.map(toPublicArticleCard),
    collection: input.collection,
  };
}

export function toPublicCollection(collection: {
  title: string;
  slug: string;
  description: string | null;
  items: Array<{ title: string; urlPath: string; entityType: string }>;
}): PublicCollection {
  return {
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    items: collection.items,
  };
}

export function toPublicProgramme(programme: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programmeType: string;
  cover: { publicUrl: string | null } | null;
  episodes: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    episodeNumber: number | null;
    publishedAt: Date | null;
    durationSec: number | null;
  }>;
}): PublicProgramme {
  return {
    id: programme.id,
    name: programme.name,
    slug: programme.slug,
    description: programme.description,
    programmeType: programme.programmeType,
    coverUrl: programme.cover?.publicUrl ?? null,
    episodes: programme.episodes.map(
      (episode): PublicEpisodeCard => ({
        id: episode.id,
        title: episode.title,
        slug: episode.slug,
        description: episode.description,
        episodeNumber: episode.episodeNumber,
        publishedAt: iso(episode.publishedAt),
        durationSec: episode.durationSec,
      }),
    ),
  };
}

export function toPublicEpisode(episode: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  episodeNumber: number | null;
  durationSec: number | null;
  videoUrl: string | null;
  transcript: string | null;
  publishedAt: Date | null;
  programme: { name: string; slug: string };
  hosts: Array<{ person: { name: string; slug: string } }>;
  guests: Array<{ person: { name: string; slug: string } }>;
  campuses: Array<{ campus: { name: string; slug: string; university: { name: string; slug: string } } }>;
  thumbnail: { publicUrl: string | null } | null;
}): PublicEpisode {
  return {
    id: episode.id,
    title: episode.title,
    slug: episode.slug,
    description: episode.description,
    episodeNumber: episode.episodeNumber,
    durationSec: episode.durationSec,
    videoUrl: episode.videoUrl,
    transcript: episode.transcript,
    publishedAt: iso(episode.publishedAt),
    programme: episode.programme,
    hosts: episode.hosts.map((row) => ({ name: row.person.name, slug: row.person.slug })),
    guests: episode.guests.map((row) => ({ name: row.person.name, slug: row.person.slug })),
    campuses: episode.campuses.map((row) => campusRef(row.campus)),
    thumbnailUrl: episode.thumbnail?.publicUrl ?? null,
  };
}
