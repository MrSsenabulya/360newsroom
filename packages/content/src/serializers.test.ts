import { describe, expect, it, beforeEach } from 'vitest';
import { assertRateLimit, clearRateLimitBuckets } from '../src/rate-limit';
import { toPublicOpportunity, toPublicArticle, toPublicArticleCard } from '../src/serializers';

describe('rate limit', () => {
  beforeEach(() => clearRateLimitBuckets());

  it('allows then blocks within window', () => {
    expect(assertRateLimit('t', 2, 60_000).ok).toBe(true);
    expect(assertRateLimit('t', 2, 60_000).ok).toBe(true);
    expect(assertRateLimit('t', 2, 60_000).ok).toBe(false);
  });
});

describe('public serializers never include private commercial/source fields', () => {
  it('opportunity public DTO has no private notes keys', () => {
    const dto = toPublicOpportunity({
      id: '1',
      title: 'Internship',
      slug: 'internship',
      description: 'Desc',
      eligibility: null,
      location: null,
      workMode: 'HYBRID',
      compensation: null,
      applicationUrl: null,
      contactPublic: 'desk@example.com',
      sourceLabel: 'Careers page',
      opportunityType: 'INTERNSHIP',
      listingStatus: 'EXPIRED',
      deadline: null,
      publishedAt: null,
      organisation: { name: 'Org' },
      campuses: [],
    });

    expect(dto.applicationsClosed).toBe(true);
    expect(JSON.stringify(dto)).not.toMatch(/private|contractValue|budget/i);
  });

  it('article public DTO omits reviewNotes-style internals', () => {
    const dto = toPublicArticle({
      id: '1',
      title: 'Story',
      slug: 'story',
      standfirst: null,
      body: 'Body',
      articleType: 'NEWS',
      firstPublishedAt: null,
      lastPublishedAt: null,
      university: null,
      heroMedia: null,
      campuses: [],
      topics: [],
      authors: [],
    });

    const keys = Object.keys(dto);
    expect(keys).not.toContain('reviewNotes');
    expect(keys).not.toContain('editorialRisk');
    expect(keys).not.toContain('sources');
  });

  it('article card exposes readMinutes without body', () => {
    const body = Array.from({ length: 400 }, () => 'word').join(' ');
    const dto = toPublicArticleCard({
      id: '1',
      title: 'Story',
      slug: 'story',
      standfirst: 'Deck',
      body,
      articleType: 'NEWS',
      firstPublishedAt: null,
      campuses: [],
      heroMedia: null,
    });
    expect(dto.readMinutes).toBe(2);
    expect(JSON.stringify(dto)).not.toMatch(/"body"/);
  });
});
