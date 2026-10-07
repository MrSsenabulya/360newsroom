import { getGuideVendorBySlug } from '@campus360/content/public';
import { MediaFrame } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { ShareButtons } from '../../../components/share-buttons';
import { ProseHtml } from '../../../components/prose-html';
import { mediaUrl } from '../../../lib/media';
import { stripHtml } from '@campus360/content/sanitize';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getGuideVendorBySlug(slug);
  if (!item) return { title: 'Campus Guide · Campus 360' };
  return {
    title: item.businessName,
    description: stripHtml(item.description).slice(0, 160),
  };
}

export default async function GuideVendorPage({ params }: Props) {
  const { slug } = await params;
  const item = await getGuideVendorBySlug(slug);
  if (!item) notFound();

  return (
    <PublicChrome activePath="/guide" mainClassName="c360-main c360-main--article">
      <header className="c360-article-head">
        <p className="c360-label">
          Campus Guide
          {item.featured ? ' · Featured' : ''}
          {item.verified ? ' · Verified' : ''}
        </p>
        <h1 className="c360-article-head__title">{item.businessName}</h1>
        <p className="c360-meta" style={{ margin: 0 }}>
          {item.categoryName ?? 'Service'}
          {item.priceRange ? ` · ${item.priceRange}` : ''}
        </p>
        <ShareButtons title={item.businessName} urlPath={`/guide/${item.slug}`} />
      </header>

      <MediaFrame src={mediaUrl(item.logoUrl, 'utility')} alt="" aspect="1x1" />

      <div style={{ marginTop: 24 }}>
        <ProseHtml html={item.description} />
      </div>

      {item.address ? <p className="c360-meta">Address: {item.address}</p> : null}
      {item.openingHours ? <p className="c360-meta">Hours: {item.openingHours}</p> : null}

      <div className="c360-actions" style={{ marginTop: 24 }}>
        {item.whatsapp ? (
          <a
            className="c360-button"
            href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`}
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        ) : null}
        {item.phone ? (
          <a className="c360-button c360-button--ghost" href={`tel:${item.phone}`}>
            Call
          </a>
        ) : null}
        {item.website ? (
          <a className="c360-button c360-button--ghost" href={item.website} rel="noopener noreferrer">
            Website
          </a>
        ) : null}
        {item.instagram ? (
          <a
            className="c360-button c360-button--ghost"
            href={`https://instagram.com/${item.instagram.replace('@', '')}`}
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        ) : null}
      </div>
    </PublicChrome>
  );
}
