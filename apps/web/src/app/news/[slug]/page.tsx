import { getPublishedArticleBySlug, listPublishedArticles } from '@campus360/content/public';
import { MediaFrame, SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { ShareButtons } from '../../../components/share-buttons';
import { StoryRow, articleKicker, articleMeta } from '../../../components/story';
import { ProseHtml } from '../../../components/prose-html';
import { mediaUrl } from '../../../lib/media';
import { formatWhen } from '../../../lib/format';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: 'Article · Campus 360' };
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.standfirst ?? undefined,
    openGraph: {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.standfirst ?? undefined,
      type: 'article',
      images: article.heroUrl ? [{ url: article.heroUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const relatedPool = await listPublishedArticles(8, article.campuses[0]?.slug);
  const related = relatedPool.filter((item) => item.id !== article.id).slice(0, 3);
  const trending = relatedPool.filter((item) => item.id !== article.id).slice(0, 6);

  return (
    <PublicChrome activePath="/latest" mainClassName="c360-main c360-main--article">
      <article>
        <header className="c360-article-head">
          <p className="c360-label">
            {(article.campuses[0]?.name ?? article.universityName ?? 'Campus').toUpperCase()} /{' '}
            {article.articleType}
          </p>
          <h1 className="c360-article-head__title">{article.title}</h1>
          {article.standfirst ? <p className="c360-lede" style={{ marginBottom: 0 }}>{article.standfirst}</p> : null}
          <p className="c360-article-head__byline">
            By {article.authors.map((author) => author.name).join(', ') || 'Campus 360'}
          </p>
          <p className="c360-meta" style={{ margin: 0 }}>
            {formatWhen(article.firstPublishedAt)}
          </p>
          <ShareButtons title={article.title} urlPath={`/news/${article.slug}`} />
        </header>

        <figure className="c360-article-hero">
          <MediaFrame
            src={mediaUrl(article.heroUrl, 'story')}
            alt={article.heroAlt ?? ''}
            aspect="16x9"
          />
          {article.heroAlt ? <figcaption className="c360-article-hero__credit">{article.heroAlt}</figcaption> : null}
        </figure>

        <ProseHtml html={article.body} className="c360-story-body" />

        {article.topics.length > 0 ? (
          <p className="c360-meta" style={{ marginTop: 32 }}>
            Topics:{' '}
            {article.topics.map((topic, index) => (
              <span key={topic.slug}>
                {index > 0 ? ', ' : ''}
                <a href={`/topics/${topic.slug}`}>{topic.name}</a>
              </span>
            ))}
          </p>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section style={{ marginTop: 64 }}>
          <SectionHead title="Related Stories" />
          <div className="c360-story-rows">
            {related.map((item) => (
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
        </section>
      ) : null}

      {trending.length > 0 ? (
        <section>
          <SectionHead title="Trending" href="/latest" />
          <div className="c360-trending">
            {trending.map((item, index) => (
              <a key={item.id} className="c360-trending__item" href={`/news/${item.slug}`}>
                <span className="c360-trending__num">{index + 1}</span>
                <span>
                  <p className="c360-label">{articleKicker(item)}</p>
                  <p className="c360-trending__title">{item.title}</p>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </PublicChrome>
  );
}
