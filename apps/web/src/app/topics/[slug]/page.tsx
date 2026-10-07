import { getTopicHub } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { StoryRow, articleKicker, articleMeta } from '../../../components/story';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = await getTopicHub(slug);
  if (!hub) return { title: 'Topic · Campus 360' };
  return {
    title: hub.name,
    description: hub.description ?? `${hub.name} on Campus 360`,
  };
}

export default async function TopicHubPage({ params }: Props) {
  const { slug } = await params;
  const hub = await getTopicHub(slug);
  if (!hub) notFound();

  return (
    <PublicChrome activePath="/topics">
      <p className="c360-label">Topic</p>
      <h1 className="c360-title">{hub.name}</h1>
      {hub.description ? <p className="c360-lede">{hub.description}</p> : null}

      <section>
        <SectionHead title="Latest coverage" />
        {hub.articles.length === 0 ? (
          <p className="c360-meta">No published articles on this topic yet.</p>
        ) : (
          <div className="c360-story-rows">
            {hub.articles.map((item) => (
              <StoryRow
                key={item.id}
                href={`/news/${item.slug}`}
                title={item.title}
                kicker={articleKicker(item)}
                deck={item.standfirst}
                meta={articleMeta(item)}
                imageUrl={item.heroUrl}
                imageAlt={item.heroAlt}
              />
            ))}
          </div>
        )}
      </section>

      {hub.collection && hub.collection.items.length > 0 ? (
        <section>
          <SectionHead title={hub.collection.title} href={`/collections/${hub.collection.slug}`} />
          <div className="c360-story-rows">
            {hub.collection.items.map((item) => (
              <StoryRow
                key={`${item.entityType}-${item.urlPath}`}
                href={item.urlPath}
                title={item.title}
                kicker={item.entityType}
                placeholder="utility"
              />
            ))}
          </div>
        </section>
      ) : null}
    </PublicChrome>
  );
}
