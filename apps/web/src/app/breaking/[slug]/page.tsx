import { getPublishedBreakingBySlug } from '@campus360/content/public';
import { PublicChrome } from '../../../components/public-chrome';
import { ShareButtons } from '../../../components/share-buttons';
import { formatWhen } from '../../../lib/format';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedBreakingBySlug(slug);
  if (!item) return { title: 'Breaking · Campus 360' };
  return {
    title: item.headline,
    description: item.shortUpdate,
    openGraph: { title: item.headline, description: item.shortUpdate, type: 'article' },
  };
}

export default async function BreakingPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedBreakingBySlug(slug);
  if (!item) notFound();

  return (
    <PublicChrome activePath="/latest" mainClassName="c360-main c360-main--article">
      <header className="c360-article-head">
        <div className="c360-actions">
          <span className="c360-pill">
            {item.developmentState === 'DEVELOPING' ? 'Developing' : 'Breaking'}
          </span>
        </div>
        <h1 className="c360-article-head__title">{item.headline}</h1>
        <p className="c360-lede" style={{ marginBottom: 0 }}>
          {item.shortUpdate}
        </p>
        <p className="c360-meta" style={{ margin: 0 }}>
          {item.campus ? `${item.campus.name} · ` : ''}
          Updated {formatWhen(item.lastPublishedAt ?? item.firstPublishedAt)}
        </p>
        {item.sourceContext ? <p className="c360-meta">Source context: {item.sourceContext}</p> : null}
        <ShareButtons title={item.headline} urlPath={`/breaking/${item.slug}`} />
      </header>

      <hr className="c360-rule" />
      <h2 style={{ fontSize: '1.125rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Timeline
      </h2>
      <ul className="c360-list">
        {item.timeline.map((entry) => (
          <li key={entry.id} className="c360-list__item">
            <p className="c360-meta">{formatWhen(entry.occurredAt)}</p>
            <p style={{ margin: 0 }}>{entry.body}</p>
          </li>
        ))}
      </ul>
      {item.relatedArticleSlug ? (
        <p style={{ marginTop: 24 }}>
          <a className="c360-button" href={`/news/${item.relatedArticleSlug}`}>
            Read full article
          </a>
        </p>
      ) : null}
    </PublicChrome>
  );
}
