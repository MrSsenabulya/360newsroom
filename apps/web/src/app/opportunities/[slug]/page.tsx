import { getOpportunityBySlug } from '@campus360/content/public';
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
  const item = await getOpportunityBySlug(slug);
  if (!item) return { title: 'Opportunity · Campus 360' };
  return {
    title: item.title,
    description: item.eligibility ?? stripHtml(item.description).slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getOpportunityBySlug(slug);
  if (!item) notFound();

  return (
    <PublicChrome activePath="/opportunities" mainClassName="c360-main c360-main--article">
      <header className="c360-article-head">
        <p className="c360-label">{item.opportunityType}</p>
        <h1 className="c360-article-head__title">{item.title}</h1>
        {item.applicationsClosed ? (
          <span className="c360-pill" style={{ width: 'fit-content' }}>
            Applications closed
          </span>
        ) : null}
        <p className="c360-meta" style={{ margin: 0 }}>
          {item.organisationName ?? 'Organisation'}
          {item.location ? ` · ${item.location}` : ''}
          {` · ${item.workMode}`}
          {item.deadline ? ` · deadline ${formatRelative(item.deadline)}` : ''}
        </p>
        <ShareButtons title={item.title} urlPath={`/opportunities/${item.slug}`} />
      </header>

      <MediaFrame src={mediaUrl(null, 'utility')} alt="" aspect="16x9" />

      <article className="c360-stack" style={{ marginTop: 24 }}>
        <ProseHtml html={item.description} />
        {item.eligibility ? (
          <div className="c360-panel">
            <p className="c360-label">Eligibility</p>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{item.eligibility}</p>
          </div>
        ) : null}
        {item.compensation ? <p className="c360-meta">Compensation: {item.compensation}</p> : null}
        {item.sourceLabel ? <p className="c360-meta">Source: {item.sourceLabel}</p> : null}
        {item.contactPublic ? <p className="c360-meta">Contact: {item.contactPublic}</p> : null}
        {!item.applicationsClosed && item.applicationUrl ? (
          <a className="c360-button" href={item.applicationUrl} rel="noopener noreferrer">
            Apply
          </a>
        ) : null}
      </article>
    </PublicChrome>
  );
}
