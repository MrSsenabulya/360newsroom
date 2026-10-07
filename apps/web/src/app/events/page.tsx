import { listPublishedEvents } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryRow } from '../../components/story';
import { formatRelative } from '../../lib/format';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ range?: string }> };

const RANGES = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'week', label: 'This week' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All' },
] as const;

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const campusSlug = await getPreferredCampusSlug();
  const range = (RANGES.find((item) => item.id === params.range)?.id ?? 'upcoming') as
    | 'upcoming'
    | 'week'
    | 'past'
    | 'all';

  const items = await listPublishedEvents({ limit: 40, campusSlug, range });

  return (
    <PublicChrome activePath="/events">
      <SectionHead title="Events" />
      <p className="c360-lede">Campus gatherings with clear temporal states. Ended events stay available.</p>

      <div className="c360-filter-row">
        {RANGES.map((item) => (
          <a
            key={item.id}
            className={item.id === range ? 'is-active' : undefined}
            aria-current={item.id === range ? 'page' : undefined}
            href={`/events?range=${item.id}`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="c360-meta">No events in this range.</p>
      ) : (
        <div className="c360-story-rows">
          {items.map((item) => (
            <StoryRow
              key={item.id}
              href={`/events/${item.slug}`}
              title={item.name}
              kicker={`${item.lifecycleStatus} · ${item.eventType}`}
              deck={[item.venue, item.campusName].filter(Boolean).join(' · ') || null}
              meta={formatRelative(item.startAt).toUpperCase()}
              placeholder="utility"
            />
          ))}
        </div>
      )}
    </PublicChrome>
  );
}
