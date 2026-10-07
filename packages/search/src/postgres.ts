import { prisma, PublicationStatus } from '@campus360/db';
import type {
  SearchAdapter,
  SearchDocument,
  SearchEntityType,
  SearchHealth,
  SearchHit,
  SearchInput,
  SearchResponse,
} from './types';

/**
 * Postgres-backed SearchAdapter for V1 while a dedicated engine is undecided.
 * Search failure must not take down the site — callers should catch and degrade.
 */
export function createPostgresSearchAdapter(): SearchAdapter {
  return {
    async search(input: SearchInput): Promise<SearchResponse> {
      const query = input.query.trim();
      const limit = Math.min(input.limit ?? 24, 50);
      const types = input.contentTypes;
      const campusSlug = input.campusSlug;

      if (!query) {
        return emptyResponse(query);
      }

      const hits: SearchHit[] = [];

      const want = (type: SearchEntityType) => !types || types.includes(type);

      if (want('Article')) {
        const articles = await prisma.article.findMany({
          where: {
            publicationStatus: PublicationStatus.PUBLISHED,
            AND: [
              {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { standfirst: { contains: query, mode: 'insensitive' } },
                  { body: { contains: query, mode: 'insensitive' } },
                ],
              },
              campusSlug
                ? { campuses: { some: { campus: { slug: campusSlug } } } }
                : {},
            ],
          },
          take: limit,
          orderBy: { firstPublishedAt: 'desc' },
          include: {
            campuses: { include: { campus: true } },
          },
        });

        for (const article of articles) {
          hits.push({
            id: article.id,
            type: 'Article',
            title: article.title,
            url: `/news/${article.slug}`,
            summary: article.standfirst,
            campusSlug: article.campuses[0]?.campus.slug ?? null,
            publishedAt: article.firstPublishedAt?.toISOString() ?? null,
          });
        }
      }

      if (want('BreakingUpdate')) {
        const breaking = await prisma.breakingUpdate.findMany({
          where: {
            publicationStatus: PublicationStatus.PUBLISHED,
            AND: [
              {
                OR: [
                  { headline: { contains: query, mode: 'insensitive' } },
                  { shortUpdate: { contains: query, mode: 'insensitive' } },
                ],
              },
              campusSlug ? { campus: { slug: campusSlug } } : {},
            ],
          },
          take: limit,
          orderBy: { firstPublishedAt: 'desc' },
          include: { campus: true },
        });

        for (const item of breaking) {
          hits.push({
            id: item.id,
            type: 'BreakingUpdate',
            title: item.headline,
            url: `/breaking/${item.slug}`,
            summary: item.shortUpdate,
            campusSlug: item.campus?.slug ?? null,
            publishedAt: item.firstPublishedAt?.toISOString() ?? null,
          });
        }
      }

      if (want('Campus')) {
        const campuses = await prisma.campus.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
              { university: { name: { contains: query, mode: 'insensitive' } } },
            ],
          },
          take: 10,
          include: { university: true },
        });
        for (const campus of campuses) {
          hits.push({
            id: campus.id,
            type: 'Campus',
            title: campus.name,
            url: `/campus/${campus.slug}`,
            summary: campus.university.name,
            campusSlug: campus.slug,
            universitySlug: campus.university.slug,
          });
        }
      }

      if (want('University')) {
        const universities = await prisma.university.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
              { shortName: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });
        for (const university of universities) {
          hits.push({
            id: university.id,
            type: 'University',
            title: university.name,
            url: `/campus?university=${university.slug}`,
            summary: university.shortName,
            universitySlug: university.slug,
          });
        }
      }

      if (want('Programme')) {
        const programmes = await prisma.programme.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        });
        for (const programme of programmes) {
          hits.push({
            id: programme.id,
            type: 'Programme',
            title: programme.name,
            url: `/watch/programmes/${programme.slug}`,
            summary: programme.description,
          });
        }
      }

      if (want('Episode')) {
        const episodes = await prisma.episode.findMany({
          where: {
            publicationStatus: PublicationStatus.PUBLISHED,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
          include: { programme: true },
        });
        for (const episode of episodes) {
          hits.push({
            id: episode.id,
            type: 'Episode',
            title: episode.title,
            url: `/watch/programmes/${episode.programme.slug}/${episode.slug}`,
            summary: episode.description,
            publishedAt: episode.publishedAt?.toISOString() ?? null,
          });
        }
      }

      if (want('Opportunity')) {
        const opportunities = await prisma.opportunity.findMany({
          where: {
            publicationStatus: PublicationStatus.PUBLISHED,
            AND: [
              {
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { organisation: { name: { contains: query, mode: 'insensitive' } } },
                ],
              },
              campusSlug
                ? { campuses: { some: { campus: { slug: campusSlug } } } }
                : {},
            ],
          },
          take: limit,
          orderBy: { deadline: 'asc' },
          include: { organisation: true },
        });
        for (const item of opportunities) {
          hits.push({
            id: item.id,
            type: 'Opportunity',
            title: item.title,
            url: `/opportunities/${item.slug}`,
            summary: item.organisation?.name ?? item.opportunityType,
            publishedAt: item.publishedAt?.toISOString() ?? null,
          });
        }
      }

      if (want('Event')) {
        const events = await prisma.event.findMany({
          where: {
            publicationStatus: PublicationStatus.PUBLISHED,
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { venue: { contains: query, mode: 'insensitive' } },
                ],
              },
              campusSlug ? { campus: { slug: campusSlug } } : {},
            ],
          },
          take: limit,
          orderBy: { startAt: 'asc' },
          include: { campus: true },
        });
        for (const item of events) {
          hits.push({
            id: item.id,
            type: 'Event',
            title: item.name,
            url: `/events/${item.slug}`,
            summary: item.venue ?? item.lifecycleStatus,
            campusSlug: item.campus?.slug ?? null,
            publishedAt: item.startAt.toISOString(),
          });
        }
      }

      if (want('Vendor')) {
        const vendors = await prisma.vendor.findMany({
          where: {
            listingStatus: 'ACTIVE',
            AND: [
              {
                OR: [
                  { businessName: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                ],
              },
              campusSlug
                ? { campuses: { some: { campus: { slug: campusSlug } } } }
                : {},
            ],
          },
          take: 15,
          include: { category: true },
        });
        for (const vendor of vendors) {
          hits.push({
            id: vendor.id,
            type: 'Vendor',
            title: vendor.businessName,
            url: `/guide/${vendor.slug}`,
            summary: vendor.category?.name ?? 'Campus Guide',
          });
        }
      }

      // Entity-aware ranking: campus/university/programme titles float for short queries
      const ranked = rankHits(query, hits).slice(0, limit);
      const grouped = groupHits(ranked);

      return {
        query,
        total: ranked.length,
        hits: ranked,
        grouped,
        provider: 'postgres',
      };
    },

    async index(_document: SearchDocument) {
      // No-op for Postgres adapter — content is queried live.
    },

    async remove(_type: SearchEntityType, _id: string) {
      // No-op for Postgres adapter.
    },

    async health(): Promise<SearchHealth> {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { ok: true, provider: 'postgres' };
      } catch (error) {
        return {
          ok: false,
          provider: 'postgres',
          detail: error instanceof Error ? error.message : 'unreachable',
        };
      }
    },
  };
}

function emptyResponse(query: string): SearchResponse {
  return {
    query,
    total: 0,
    hits: [],
    grouped: {},
    provider: 'postgres',
  };
}

function rankHits(query: string, hits: SearchHit[]): SearchHit[] {
  const q = query.toLowerCase();
  return [...hits].sort((a, b) => score(b, q) - score(a, q));
}

function score(hit: SearchHit, q: string): number {
  const title = hit.title.toLowerCase();
  let value = 0;
  if (title === q) value += 100;
  if (title.startsWith(q)) value += 40;
  if (title.includes(q)) value += 20;
  if (hit.type === 'Campus' || hit.type === 'University') value += 15;
  if (hit.type === 'Programme') value += 10;
  if (hit.type === 'BreakingUpdate') value += 8;
  if (hit.type === 'Opportunity' && (q.includes('intern') || q.includes('scholar'))) value += 30;
  if (hit.type === 'Event') value += 12;
  if (hit.type === 'Vendor') value += 10;
  if (hit.type === 'Opportunity' && q.includes('intern')) value += 25;
  return value;
}

function groupHits(hits: SearchHit[]) {
  const grouped: SearchResponse['grouped'] = {};
  for (const hit of hits) {
    const list = grouped[hit.type] ?? [];
    list.push(hit);
    grouped[hit.type] = list;
  }
  return grouped;
}

/** App-wide default until Meilisearch/Typesense is chosen. */
export const searchAdapter = createPostgresSearchAdapter();
