import {
  listActiveOpportunities,
  listPublishedEvents,
  listGuideVendors,
  listHomeArticles,
  listPublishedProgrammes,
} from '@campus360/content/public';
import { stripHtml } from '@campus360/content/sanitize';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../components/public-chrome';
import { HomeHeroSlider } from '../components/home-hero-slider';
import { StoryRow, StoryTile, WatchCard, articleKicker, articleMeta } from '../components/story';
import { formatRelative } from '../lib/format';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const campusSlug = await getPreferredCampusSlug();
  let articles: Awaited<ReturnType<typeof listHomeArticles>> = [];
  let programmes: Awaited<ReturnType<typeof listPublishedProgrammes>> = [];
  let opportunities: Awaited<ReturnType<typeof listActiveOpportunities>> = [];
  let events: Awaited<ReturnType<typeof listPublishedEvents>> = [];
  let vendors: Awaited<ReturnType<typeof listGuideVendors>> = [];
  let dbError: string | null = null;

  try {
    [articles, programmes, opportunities, events, vendors] = await Promise.all([
      listHomeArticles(8, campusSlug),
      listPublishedProgrammes(),
      listActiveOpportunities({ limit: 4, campusSlug }),
      listPublishedEvents({ limit: 4, campusSlug, range: 'upcoming' }),
      listGuideVendors({ limit: 4, campusSlug }),
    ]);
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Database unreachable';
  }

  const heroSlides = articles.slice(0, 3).map((item) => ({
    id: item.id,
    href: `/news/${item.slug}`,
    title: item.title,
    standfirst: item.standfirst,
    imageUrl: item.heroUrl,
    imageAlt: item.heroAlt,
    readMinutes: item.readMinutes,
  }));
  const latest = articles.slice(0, 6);
  const watchItems = programmes.slice(0, 4);

  return (
    <PublicChrome activePath="/">
      {dbError ? (
        <div className="c360-panel" style={{ marginBottom: 24, borderColor: 'var(--status-warning)' }}>
          <p className="c360-kicker">Database offline</p>
          <p className="c360-meta" style={{ margin: 0 }}>
            Check <code>DATABASE_URL</code> and restart the dev server.
          </p>
        </div>
      ) : null}

      {heroSlides.length > 0 ? (
        <HomeHeroSlider slides={heroSlides} />
      ) : (
        <p className="c360-meta">No published stories yet.</p>
      )}

      <section aria-label="Latest stories">
        <SectionHead title="Latest Stories" href="/latest" />
        <div className="c360-story-rows">
          {latest.map((item) => (
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

      {watchItems.length > 0 ? (
        <section className="c360-bleed-inverse" aria-label="Watch">
          <div className="c360-bleed-inverse__inner">
            <SectionHead title="Latest Episodes" href="/watch" linkLabel="See all episodes" inverse />
            <div className="c360-watch-rail">
              {watchItems.map((programme) => {
                const episode = programme.episodes[0];
                const href = episode
                  ? `/watch/programmes/${programme.slug}/${episode.slug}`
                  : `/watch/programmes/${programme.slug}`;
                return (
                  <WatchCard
                    key={programme.id}
                    href={href}
                    title={episode?.title ?? programme.name}
                    kicker={programme.name}
                    imageUrl={programme.coverUrl}
                  />
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label="Opportunities">
        <SectionHead title="Opportunities" href="/opportunities" />
        {opportunities.length === 0 ? (
          <p className="c360-meta">No open opportunities right now.</p>
        ) : (
          <div className="c360-tile-grid c360-tile-grid--4">
            {opportunities.map((item) => (
              <StoryTile
                key={item.id}
                href={`/opportunities/${item.slug}`}
                title={item.title}
                kicker={item.opportunityType}
                meta={
                  item.deadline
                    ? `Deadline ${formatRelative(item.deadline).toUpperCase()}`
                    : item.organisationName?.toUpperCase() ?? null
                }
                placeholder="utility"
                aspect="4x3"
              />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Events">
        <SectionHead title="Events" href="/events" />
        {events.length === 0 ? (
          <p className="c360-meta">No upcoming events listed.</p>
        ) : (
          <div className="c360-tile-grid c360-tile-grid--4">
            {events.map((item) => (
              <StoryTile
                key={item.id}
                href={`/events/${item.slug}`}
                title={item.name}
                kicker={item.eventType}
                meta={`${item.lifecycleStatus} · ${formatRelative(item.startAt).toUpperCase()}`}
                placeholder="utility"
                aspect="4x3"
              />
            ))}
          </div>
        )}
      </section>

      {vendors.length > 0 ? (
        <section aria-label="Campus Guide">
          <SectionHead title="Campus Guide" href="/guide" linkLabel="Browse" />
          <div className="c360-tile-grid c360-tile-grid--4">
            {vendors.map((item) => (
              <StoryTile
                key={item.id}
                href={`/guide/${item.slug}`}
                title={item.businessName}
                kicker={item.categoryName ?? 'Service'}
                deck={stripHtml(item.description).slice(0, 120)}
                meta={item.featured ? 'FEATURED' : null}
                placeholder="utility"
                aspect="1x1"
              />
            ))}
          </div>
        </section>
      ) : null}
    </PublicChrome>
  );
}
