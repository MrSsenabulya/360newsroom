import { getEventBySlug } from '@campus360/content/public';
import { MediaFrame } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { ShareButtons } from '../../../components/share-buttons';
import { ProseHtml } from '../../../components/prose-html';
import { mediaUrl } from '../../../lib/media';
import { formatRelative } from '../../../lib/format';
import { stripHtml } from '@campus360/content/sanitize';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) return { title: 'Event · Campus 360' };
  return {
    title: item.name,
    description: stripHtml(item.description).slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getEventBySlug(slug);
  if (!item) notFound();

  return (
    <PublicChrome activePath="/events" mainClassName="c360-main c360-main--article">
      <header className="c360-article-head">
        <p className="c360-label">
          {item.lifecycleStatus} · {item.eventType}
        </p>
        <h1 className="c360-article-head__title">{item.name}</h1>
        <p className="c360-meta" style={{ margin: 0 }}>
          {formatRelative(item.startAt)}
          {item.endAt ? ` → ${formatRelative(item.endAt)}` : ''}
          {item.venue ? ` · ${item.venue}` : ''}
          {item.campusName ? ` · ${item.campusName}` : ''}
        </p>
        <ShareButtons title={item.name} urlPath={`/events/${item.slug}`} />
      </header>

      <figure className="c360-article-hero">
        <MediaFrame src={mediaUrl(item.posterUrl, 'utility')} alt="" aspect="16x9" />
      </figure>

      <article className="c360-stack">
        <ProseHtml html={item.description} />
        {item.priceLabel ? <p className="c360-meta">Price: {item.priceLabel}</p> : null}
        {item.organisationName ? <p className="c360-meta">Organiser: {item.organisationName}</p> : null}
        {item.contactPublic ? <p className="c360-meta">Contact: {item.contactPublic}</p> : null}
        {item.ticketUrl ? (
          <a className="c360-button" href={item.ticketUrl} rel="noopener noreferrer">
            Tickets / register
          </a>
        ) : null}
      </article>
    </PublicChrome>
  );
}
