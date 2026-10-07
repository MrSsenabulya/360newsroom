import { listPublishedArticles, listPublishedBreaking } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryRow, articleKicker, articleMeta } from '../../components/story';
import { formatRelative } from '../../lib/format';

export const dynamic = 'force-dynamic';

export default async function LatestPage() {
  const campusSlug = await getPreferredCampusSlug();
  const [articles, breaking] = await Promise.all([
    listPublishedArticles(30, campusSlug),
    listPublishedBreaking(10, campusSlug),
  ]);

  const [fallbackArticles, fallbackBreaking] =
    campusSlug && articles.length === 0 && breaking.length === 0
      ? await Promise.all([listPublishedArticles(30), listPublishedBreaking(10)])
      : [articles, breaking];

  const feed = [
    ...fallbackBreaking.map((item) => ({
      kind: 'breaking' as const,
      id: item.id,
      title: item.headline,
      href: `/breaking/${item.slug}`,
      kicker: 'Breaking',
      deck: item.shortUpdate,
      meta: `${(item.campusName ?? 'Campus').toUpperCase()} · ${formatRelative(item.firstPublishedAt).toUpperCase()}`,
      imageUrl: null as string | null,
      at: item.firstPublishedAt,
    })),
    ...fallbackArticles.map((item) => ({
      kind: 'article' as const,
      id: item.id,
      title: item.title,
      href: `/news/${item.slug}`,
      kicker: articleKicker(item),
      deck: item.standfirst,
      meta: articleMeta(item),
      imageUrl: item.heroUrl,
      imageAlt: item.heroAlt,
      at: item.firstPublishedAt,
    })),
  ].sort((a, b) => {
    const aTime = a.at ? new Date(a.at).getTime() : 0;
    const bTime = b.at ? new Date(b.at).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <PublicChrome activePath="/latest">
      <SectionHead title="Latest Stories" />
      {campusSlug ? (
        <p className="c360-meta" style={{ marginTop: -16, marginBottom: 24 }}>
          Prioritising {campusSlug}. Cross-campus stories fill in when local is quiet.
        </p>
      ) : null}
      <div className="c360-story-rows">
        {feed.map((item) => (
          <StoryRow
            key={`${item.kind}-${item.id}`}
            href={item.href}
            title={item.title}
            kicker={item.kicker}
            deck={item.deck}
            meta={item.meta}
            imageUrl={item.imageUrl}
            imageAlt={'imageAlt' in item ? item.imageAlt : null}
            placeholder={item.kind === 'breaking' ? 'utility' : 'story'}
          />
        ))}
      </div>
      {feed.length === 0 ? <p className="c360-meta">Nothing published yet.</p> : null}
    </PublicChrome>
  );
}
