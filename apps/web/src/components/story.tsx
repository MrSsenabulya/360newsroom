import { MediaFrame } from '@campus360/ui';
import { mediaUrl, type PlaceholderKind } from '../lib/media';
import { formatRelative } from '../lib/format';

export type StoryLink = {
  href: string;
  title: string;
  kicker?: string | null;
  deck?: string | null;
  meta?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  placeholder?: PlaceholderKind;
};

export function StoryTile({
  href,
  title,
  kicker,
  deck,
  meta,
  imageUrl,
  imageAlt,
  placeholder = 'story',
  aspect = '4x3',
}: StoryLink & { aspect?: '16x9' | '4x3' | '3x4' | '1x1' }) {
  return (
    <a className="c360-story-tile" href={href}>
      <MediaFrame src={mediaUrl(imageUrl, placeholder)} alt={imageAlt ?? ''} aspect={aspect} />
      {kicker ? <p className="c360-story-tile__kicker">{kicker}</p> : null}
      <h3 className="c360-story-tile__title">{title}</h3>
      {deck ? <p className="c360-story-row__deck">{deck}</p> : null}
      {meta ? <p className="c360-story-tile__meta">{meta}</p> : null}
    </a>
  );
}

export function StoryRow({
  href,
  title,
  kicker,
  deck,
  meta,
  imageUrl,
  imageAlt,
  placeholder = 'story',
}: StoryLink) {
  return (
    <a className="c360-story-row" href={href}>
      <div className="c360-story-row__media">
        <MediaFrame src={mediaUrl(imageUrl, placeholder)} alt={imageAlt ?? ''} aspect="16x9" />
      </div>
      <div className="c360-story-row__body">
        {kicker ? <p className="c360-story-row__kicker">{kicker}</p> : null}
        <h3 className="c360-story-row__title">{title}</h3>
        {deck ? <p className="c360-story-row__deck">{deck}</p> : null}
        {meta ? <p className="c360-story-row__meta">{meta}</p> : null}
      </div>
    </a>
  );
}

export function articleKicker(article: {
  articleType: string;
  campuses: Array<{ name: string }>;
}): string {
  const campus = article.campuses[0]?.name;
  return campus ? `${campus} / ${article.articleType}` : article.articleType;
}

export function articleMeta(article: {
  firstPublishedAt: string | null;
  authors?: Array<{ name: string }>;
}): string {
  const when = formatRelative(article.firstPublishedAt).toUpperCase();
  const author = article.authors?.[0]?.name?.toUpperCase();
  if (author && when) return `${author} · ${when}`;
  return when;
}

export function WatchCard({
  href,
  title,
  kicker,
  imageUrl,
}: {
  href: string;
  title: string;
  kicker?: string | null;
  imageUrl?: string | null;
}) {
  return (
    <a className="c360-watch-card" href={href}>
      <div className="c360-watch-card__media">
        <MediaFrame src={mediaUrl(imageUrl, 'watch')} alt="" aspect="16x9" />
        <div className="c360-watch-card__play" aria-hidden="true">
          <span />
        </div>
      </div>
      {kicker ? <p className="c360-watch-card__kicker">{kicker}</p> : null}
      <h3 className="c360-watch-card__title">{title}</h3>
    </a>
  );
}
