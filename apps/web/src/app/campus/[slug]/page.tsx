import { getCampusHub } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../../components/public-chrome';
import { StoryRow, StoryTile, articleKicker, articleMeta } from '../../../components/story';
import { formatRelative } from '../../../lib/format';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = await getCampusHub(slug);
  if (!hub) return { title: 'Campus · Campus 360' };
  return {
    title: `${hub.name} · Campus 360`,
    description: hub.description ?? `${hub.name} on Campus 360`,
  };
}

export default async function CampusHubPage({ params }: Props) {
  const { slug } = await params;
  const hub = await getCampusHub(slug);
  if (!hub) notFound();

  return (
    <PublicChrome activePath="/campus">
      <p className="c360-label">{hub.universityName}</p>
      <h1 className="c360-title">{hub.name}</h1>
      {hub.description ? <p className="c360-lede">{hub.description}</p> : null}
      {hub.locationLabel ? <p className="c360-meta">{hub.locationLabel}</p> : null}

      {hub.activeBreaking.length > 0 ? (
        <section style={{ marginTop: 40 }}>
          <SectionHead title="Breaking" />
          <div className="c360-story-rows">
            {hub.activeBreaking.map((item) => (
              <StoryRow
                key={item.id}
                href={`/breaking/${item.slug}`}
                title={item.headline}
                kicker="Breaking"
                deck={item.shortUpdate}
                meta={formatRelative(item.firstPublishedAt).toUpperCase()}
                placeholder="utility"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: 24 }}>
        <SectionHead title="Latest" href="/latest" />
        {hub.latestArticles.length === 0 ? (
          <p className="c360-meta">No stories for this campus yet.</p>
        ) : (
          <div className="c360-story-rows">
            {hub.latestArticles.map((item) => (
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

      <section>
        <SectionHead title="Events" href="/events" />
        {hub.upcomingEvents.length === 0 ? (
          <p className="c360-meta">No upcoming events.</p>
        ) : (
          <div className="c360-tile-grid c360-tile-grid--3">
            {hub.upcomingEvents.map((item) => (
              <StoryTile
                key={item.id}
                href={`/events/${item.slug}`}
                title={item.name}
                kicker={item.lifecycleStatus}
                meta={formatRelative(item.startAt).toUpperCase()}
                placeholder="utility"
                aspect="4x3"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Opportunities" href="/opportunities" />
        {hub.activeOpportunities.length === 0 ? (
          <p className="c360-meta">No open opportunities.</p>
        ) : (
          <div className="c360-tile-grid c360-tile-grid--3">
            {hub.activeOpportunities.map((item) => (
              <StoryTile
                key={item.id}
                href={`/opportunities/${item.slug}`}
                title={item.title}
                kicker={item.opportunityType}
                placeholder="utility"
                aspect="4x3"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Campus Guide" href="/guide" />
        {hub.guideVendors.length === 0 ? (
          <p className="c360-meta">No Guide listings yet.</p>
        ) : (
          <div className="c360-tile-grid c360-tile-grid--3">
            {hub.guideVendors.map((item) => (
              <StoryTile
                key={item.id}
                href={`/guide/${item.slug}`}
                title={item.businessName}
                kicker={item.categoryName ?? 'Service'}
                placeholder="utility"
                aspect="1x1"
              />
            ))}
          </div>
        )}
      </section>
    </PublicChrome>
  );
}
