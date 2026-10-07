import { prisma, PublicationStatus, BreakingDevelopmentState, OpportunityListingStatus, EventLifecycleStatus, VendorListingStatus, CollectionStatus } from '@campus360/db';
import {
  toPublicArticle,
  toPublicArticleCard,
  toPublicBreaking,
  toPublicBreakingCard,
  toPublicCampusHub,
  toPublicCollection,
  toPublicEpisode,
  toPublicEvent,
  toPublicEventCard,
  toPublicOpportunity,
  toPublicOpportunityCard,
  toPublicProgramme,
  toPublicTopicHub,
  toPublicVendor,
  toPublicVendorCard,
} from './serializers';

const published = PublicationStatus.PUBLISHED;

const campusInclude = {
  university: { select: { name: true, slug: true } },
} as const;

export async function listPublishedArticles(limit = 20, campusSlug?: string | null) {
  const rows = await prisma.article.findMany({
    where: {
      publicationStatus: published,
      ...(campusSlug
        ? { campuses: { some: { campus: { slug: campusSlug } } } }
        : {}),
    },
    orderBy: { firstPublishedAt: 'desc' },
    take: limit,
    include: {
      heroMedia: { select: { publicUrl: true, altText: true } },
      campuses: { include: { campus: { include: campusInclude } } },
    },
  });
  return rows.map(toPublicArticleCard);
}

/** Prefer selected campus stories, then fill with network-wide latest. */
export async function listHomeArticles(limit = 8, campusSlug?: string | null) {
  if (!campusSlug) return listPublishedArticles(limit);
  const local = await listPublishedArticles(limit, campusSlug);
  if (local.length >= limit) return local;
  const rest = await listPublishedArticles(limit);
  const seen = new Set(local.map((item) => item.id));
  return [...local, ...rest.filter((item) => !seen.has(item.id))].slice(0, limit);
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: { slug, publicationStatus: published },
    include: {
      university: { select: { name: true } },
      heroMedia: { select: { publicUrl: true, altText: true } },
      campuses: { include: { campus: { include: campusInclude } } },
      topics: { include: { topic: { select: { name: true, slug: true } } } },
      authors: { include: { person: { select: { name: true, slug: true } } } },
    },
  });
  return article ? toPublicArticle(article) : null;
}

export async function listPublishedBreaking(limit = 20, campusSlug?: string | null) {
  const rows = await prisma.breakingUpdate.findMany({
    where: {
      publicationStatus: published,
      ...(campusSlug ? { campus: { slug: campusSlug } } : {}),
    },
    orderBy: { firstPublishedAt: 'desc' },
    take: limit,
    include: { campus: { select: { name: true, slug: true } } },
  });
  return rows.map(toPublicBreakingCard);
}

export async function listActiveBreakingBanner(limit = 3) {
  const rows = await prisma.breakingUpdate.findMany({
    where: {
      publicationStatus: published,
      bannerEnabled: true,
      developmentState: {
        in: [BreakingDevelopmentState.DEVELOPING, BreakingDevelopmentState.VERIFICATION],
      },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { lastPublishedAt: 'desc' },
    take: limit,
    include: { campus: { select: { name: true, slug: true } } },
  });
  return rows.map(toPublicBreakingCard);
}

export async function getPublishedBreakingBySlug(slug: string) {
  const item = await prisma.breakingUpdate.findFirst({
    where: { slug, publicationStatus: published },
    include: {
      campus: { include: campusInclude },
      topic: { select: { name: true, slug: true } },
      relatedArticle: { select: { slug: true } },
      timeline: { orderBy: { occurredAt: 'desc' } },
    },
  });
  return item ? toPublicBreaking(item) : null;
}

export async function listActiveCampuses() {
  return prisma.campus.findMany({
    where: { isActive: true, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    include: { university: { select: { name: true, slug: true } } },
  });
}

export async function getCampusHub(slug: string) {
  const campus = await prisma.campus.findFirst({
    where: { slug, isActive: true },
    include: { university: { select: { name: true, slug: true } } },
  });
  if (!campus) return null;

  const now = new Date();
  const [latestArticles, activeBreaking, upcomingEvents, activeOpportunities, guideVendors] =
    await Promise.all([
      prisma.article.findMany({
        where: {
          publicationStatus: published,
          campuses: { some: { campusId: campus.id } },
        },
        orderBy: { firstPublishedAt: 'desc' },
        take: 10,
        include: {
          heroMedia: { select: { publicUrl: true, altText: true } },
          campuses: { include: { campus: { include: campusInclude } } },
        },
      }),
      prisma.breakingUpdate.findMany({
        where: {
          publicationStatus: published,
          campusId: campus.id,
          developmentState: {
            notIn: [BreakingDevelopmentState.ARCHIVED, BreakingDevelopmentState.RESOLVED],
          },
        },
        orderBy: { firstPublishedAt: 'desc' },
        take: 5,
        include: { campus: { select: { name: true, slug: true } } },
      }),
      prisma.event.findMany({
        where: {
          publicationStatus: published,
          campusId: campus.id,
          lifecycleStatus: {
            in: [EventLifecycleStatus.UPCOMING, EventLifecycleStatus.HAPPENING_NOW],
          },
          startAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
        orderBy: { startAt: 'asc' },
        take: 5,
        include: { campus: { select: { name: true, slug: true } } },
      }),
      prisma.opportunity.findMany({
        where: {
          publicationStatus: published,
          listingStatus: OpportunityListingStatus.ACTIVE,
          campuses: { some: { campusId: campus.id } },
        },
        orderBy: { deadline: 'asc' },
        take: 5,
        include: { organisation: { select: { name: true } } },
      }),
      prisma.vendor.findMany({
        where: {
          listingStatus: VendorListingStatus.ACTIVE,
          campuses: { some: { campusId: campus.id } },
        },
        orderBy: [{ featured: 'desc' }, { businessName: 'asc' }],
        take: 5,
        include: {
          category: { select: { name: true, slug: true } },
          campuses: { include: { campus: { include: campusInclude } } },
        },
      }),
    ]);

  return toPublicCampusHub({
    campus,
    latestArticles,
    activeBreaking,
    upcomingEvents,
    activeOpportunities,
    guideVendors,
  });
}

export async function listPublishedProgrammes() {
  const rows = await prisma.programme.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    include: {
      cover: { select: { publicUrl: true } },
      episodes: {
        where: { publicationStatus: published },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      },
    },
  });
  return rows.map(toPublicProgramme);
}

export async function getPublishedProgrammeBySlug(slug: string) {
  const programme = await prisma.programme.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      cover: { select: { publicUrl: true } },
      episodes: {
        where: { publicationStatus: published },
        orderBy: [{ episodeNumber: 'desc' }, { publishedAt: 'desc' }],
      },
    },
  });
  return programme ? toPublicProgramme(programme) : null;
}

export async function getPublishedEpisode(programmeSlug: string, episodeSlug: string) {
  const episode = await prisma.episode.findFirst({
    where: {
      slug: episodeSlug,
      publicationStatus: published,
      programme: { slug: programmeSlug, status: 'ACTIVE' },
    },
    include: {
      programme: { select: { name: true, slug: true } },
      hosts: { include: { person: { select: { name: true, slug: true } } } },
      guests: { include: { person: { select: { name: true, slug: true } } } },
      campuses: { include: { campus: { include: campusInclude } } },
      thumbnail: { select: { publicUrl: true } },
    },
  });
  return episode ? toPublicEpisode(episode) : null;
}

export async function listSitemapEntries() {
  const [articles, breaking, campuses, programmes, episodes, opportunities, events, vendors, topics] =
    await Promise.all([
      prisma.article.findMany({
        where: { publicationStatus: published },
        select: { slug: true, lastPublishedAt: true, firstPublishedAt: true },
      }),
      prisma.breakingUpdate.findMany({
        where: { publicationStatus: published },
        select: { slug: true, lastPublishedAt: true, firstPublishedAt: true },
      }),
      prisma.campus.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.programme.findMany({
        where: { status: 'ACTIVE' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.episode.findMany({
        where: { publicationStatus: published },
        select: {
          slug: true,
          publishedAt: true,
          programme: { select: { slug: true } },
        },
      }),
      prisma.opportunity.findMany({
        where: { publicationStatus: published },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.event.findMany({
        where: { publicationStatus: published },
        select: { slug: true, updatedAt: true, startAt: true },
      }),
      prisma.vendor.findMany({
        where: { listingStatus: VendorListingStatus.ACTIVE },
        select: { slug: true, updatedAt: true },
      }),
      prisma.topic.findMany({
        select: { slug: true },
      }),
    ]);

  return {
    articles,
    breaking,
    campuses,
    programmes,
    episodes,
    opportunities,
    events,
    vendors,
    topics,
  };
}

export async function listActiveOpportunities(opts?: {
  limit?: number;
  campusSlug?: string | null;
  type?: string | null;
  includeExpired?: boolean;
}) {
  const limit = opts?.limit ?? 24;
  const rows = await prisma.opportunity.findMany({
    where: {
      publicationStatus: published,
      listingStatus: opts?.includeExpired
        ? { in: [OpportunityListingStatus.ACTIVE, OpportunityListingStatus.EXPIRED] }
        : OpportunityListingStatus.ACTIVE,
      ...(opts?.type ? { opportunityType: opts.type as never } : {}),
      ...(opts?.campusSlug
        ? { campuses: { some: { campus: { slug: opts.campusSlug } } } }
        : {}),
    },
    orderBy: [{ deadline: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
    include: { organisation: { select: { name: true } } },
  });
  return rows.map(toPublicOpportunityCard);
}

export async function getOpportunityBySlug(slug: string) {
  const item = await prisma.opportunity.findFirst({
    where: { slug, publicationStatus: published },
    include: {
      organisation: { select: { name: true } },
      campuses: { include: { campus: { include: campusInclude } } },
    },
  });
  return item ? toPublicOpportunity(item) : null;
}

export async function listPublishedEvents(opts?: {
  limit?: number;
  campusSlug?: string | null;
  range?: 'upcoming' | 'week' | 'past' | 'all';
}) {
  const limit = opts?.limit ?? 24;
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const range = opts?.range ?? 'upcoming';

  const lifecycleFilter =
    range === 'past'
      ? { lifecycleStatus: EventLifecycleStatus.COMPLETED }
      : range === 'all'
        ? {}
        : {
            lifecycleStatus: {
              in: [EventLifecycleStatus.UPCOMING, EventLifecycleStatus.HAPPENING_NOW],
            },
          };

  const timeFilter =
    range === 'week'
      ? { startAt: { gte: now, lte: weekAhead } }
      : range === 'past'
        ? { startAt: { lt: now } }
        : range === 'upcoming'
          ? { startAt: { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) } }
          : {};

  const rows = await prisma.event.findMany({
    where: {
      publicationStatus: published,
      ...lifecycleFilter,
      ...timeFilter,
      ...(opts?.campusSlug ? { campus: { slug: opts.campusSlug } } : {}),
    },
    orderBy: { startAt: range === 'past' ? 'desc' : 'asc' },
    take: limit,
    include: { campus: { select: { name: true, slug: true } } },
  });
  return rows.map(toPublicEventCard);
}

export async function getEventBySlug(slug: string) {
  const item = await prisma.event.findFirst({
    where: { slug, publicationStatus: published },
    include: {
      campus: { select: { name: true, slug: true } },
      university: { select: { name: true } },
      organisation: { select: { name: true } },
      poster: { select: { publicUrl: true } },
    },
  });
  return item ? toPublicEvent(item) : null;
}

export async function listGuideVendors(opts?: {
  limit?: number;
  campusSlug?: string | null;
  categorySlug?: string | null;
}) {
  const limit = opts?.limit ?? 40;
  const rows = await prisma.vendor.findMany({
    where: {
      listingStatus: VendorListingStatus.ACTIVE,
      ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts?.campusSlug
        ? { campuses: { some: { campus: { slug: opts.campusSlug } } } }
        : {}),
    },
    orderBy: [{ featured: 'desc' }, { businessName: 'asc' }],
    take: limit,
    include: {
      category: { select: { name: true, slug: true } },
      campuses: { include: { campus: { include: campusInclude } } },
    },
  });
  return rows.map(toPublicVendorCard);
}

export async function getGuideVendorBySlug(slug: string) {
  const item = await prisma.vendor.findFirst({
    where: { slug, listingStatus: VendorListingStatus.ACTIVE },
    include: {
      category: { select: { name: true, slug: true } },
      campuses: { include: { campus: { include: campusInclude } } },
      logo: { select: { publicUrl: true } },
    },
  });
  return item ? toPublicVendor(item) : null;
}

export async function listVendorCategories() {
  return prisma.vendorCategory.findMany({ orderBy: { name: 'asc' } });
}

export async function listTopics() {
  return prisma.topic.findMany({ orderBy: { name: 'asc' } });
}

export async function getTopicHub(slug: string) {
  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) return null;

  const [articles, collection] = await Promise.all([
    prisma.article.findMany({
      where: {
        publicationStatus: published,
        topics: { some: { topicId: topic.id } },
      },
      orderBy: { firstPublishedAt: 'desc' },
      take: 20,
      include: {
        heroMedia: { select: { publicUrl: true, altText: true } },
        campuses: { include: { campus: { include: campusInclude } } },
      },
    }),
    prisma.collection.findFirst({
      where: {
        status: CollectionStatus.ACTIVE,
        OR: [{ topicId: topic.id }, { slug: `topic-${topic.slug}` }],
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    }),
  ]);

  return toPublicTopicHub({
    topic,
    articles,
    collection: collection
      ? {
          title: collection.title,
          slug: collection.slug,
          items: collection.items.map((item) => ({
            title: item.title,
            urlPath: item.urlPath,
            entityType: item.entityType,
          })),
        }
      : null,
  });
}

export async function getCollectionBySlug(slug: string) {
  const collection = await prisma.collection.findFirst({
    where: { slug, status: CollectionStatus.ACTIVE },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!collection) return null;
  return toPublicCollection({
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    items: collection.items.map((item) => ({
      title: item.title,
      urlPath: item.urlPath,
      entityType: item.entityType,
    })),
  });
}
