import { listActiveOpportunities } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryRow } from '../../components/story';
import { formatRelative } from '../../lib/format';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ type?: string; expired?: string }> };

const TYPES = [
  { id: '', label: 'All open' },
  { id: 'INTERNSHIP', label: 'Internships' },
  { id: 'GRADUATE_JOB', label: 'Graduate jobs' },
  { id: 'JOB', label: 'Jobs' },
  { id: 'SCHOLARSHIP', label: 'Scholarships' },
  { id: 'FELLOWSHIP', label: 'Fellowships' },
  { id: 'COMPETITION', label: 'Competitions' },
  { id: 'OTHER', label: 'Other' },
] as const;

export default async function OpportunitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const campusSlug = await getPreferredCampusSlug();
  const type = params.type || null;
  const includeExpired = params.expired === '1';

  const items = await listActiveOpportunities({
    limit: 40,
    campusSlug,
    type,
    includeExpired,
  });

  return (
    <PublicChrome activePath="/opportunities">
      <SectionHead title="Opportunities" />
      <p className="c360-lede">
        Internships, jobs, scholarships and more. Expired listings leave discovery but keep their URL.
      </p>

      <div className="c360-filter-row">
        {TYPES.map((item) => {
          const active = type === (item.id || null) || (!type && !item.id);
          return (
            <a
              key={item.id || 'all'}
              className={active ? 'is-active' : undefined}
              aria-current={active ? 'page' : undefined}
              href={
                item.id
                  ? `/opportunities?type=${item.id}${includeExpired ? '&expired=1' : ''}`
                  : `/opportunities${includeExpired ? '?expired=1' : ''}`
              }
            >
              {item.label}
            </a>
          );
        })}
        <a
          className={includeExpired ? 'is-active' : undefined}
          href={type ? `/opportunities?type=${type}&expired=1` : '/opportunities?expired=1'}
        >
          Include closed
        </a>
      </div>

      {items.length === 0 ? (
        <p className="c360-meta">No opportunities match this filter.</p>
      ) : (
        <div className="c360-story-rows">
          {items.map((item) => (
            <StoryRow
              key={item.id}
              href={`/opportunities/${item.slug}`}
              title={item.title}
              kicker={`${item.opportunityType}${item.applicationsClosed ? ' · Closed' : ''}`}
              deck={[item.organisationName, item.location].filter(Boolean).join(' · ') || null}
              meta={item.deadline ? `Deadline ${formatRelative(item.deadline).toUpperCase()}` : null}
              placeholder="utility"
            />
          ))}
        </div>
      )}
    </PublicChrome>
  );
}
