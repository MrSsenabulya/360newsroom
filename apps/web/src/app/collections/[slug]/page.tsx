import { getCollectionBySlug } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { StoryRow } from '../../../components/story';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'Collection · Campus 360' };
  return {
    title: collection.title,
    description: collection.description ?? undefined,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <PublicChrome>
      <SectionHead title={collection.title} />
      {collection.description ? <p className="c360-lede">{collection.description}</p> : null}
      <div className="c360-story-rows">
        {collection.items.map((item) => (
          <StoryRow
            key={`${item.entityType}-${item.urlPath}`}
            href={item.urlPath}
            title={item.title}
            kicker={item.entityType}
            placeholder="utility"
          />
        ))}
      </div>
    </PublicChrome>
  );
}
