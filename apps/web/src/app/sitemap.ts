import { listSitemapEntries } from '@campus360/content/public';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const entries = await listSitemapEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/latest`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/opportunities`, changeFrequency: 'hourly', priority: 0.85 },
    { url: `${base}/events`, changeFrequency: 'hourly', priority: 0.85 },
    { url: `${base}/guide`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/campus`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/topics`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/watch`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/search`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/advertise`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/tip`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/editorial-standards`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/corrections`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/advertising-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...entries.articles.map((article) => ({
      url: `${base}/news/${article.slug}`,
      lastModified: article.lastPublishedAt ?? article.firstPublishedAt ?? undefined,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...entries.breaking.map((item) => ({
      url: `${base}/breaking/${item.slug}`,
      lastModified: item.lastPublishedAt ?? item.firstPublishedAt ?? undefined,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    ...entries.campuses.map((campus) => ({
      url: `${base}/campus/${campus.slug}`,
      lastModified: campus.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...entries.programmes.map((programme) => ({
      url: `${base}/watch/programmes/${programme.slug}`,
      lastModified: programme.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...entries.episodes.map((episode) => ({
      url: `${base}/watch/programmes/${episode.programme.slug}/${episode.slug}`,
      lastModified: episode.publishedAt ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...entries.opportunities.map((item) => ({
      url: `${base}/opportunities/${item.slug}`,
      lastModified: item.updatedAt ?? item.publishedAt ?? undefined,
      changeFrequency: 'daily' as const,
      priority: 0.65,
    })),
    ...entries.events.map((item) => ({
      url: `${base}/events/${item.slug}`,
      lastModified: item.updatedAt ?? item.startAt,
      changeFrequency: 'daily' as const,
      priority: 0.65,
    })),
    ...entries.vendors.map((item) => ({
      url: `${base}/guide/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.55,
    })),
    ...entries.topics.map((topic) => ({
      url: `${base}/topics/${topic.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
}
