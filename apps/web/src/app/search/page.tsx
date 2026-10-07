import { searchAdapter, type SearchEntityType } from '@campus360/search';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryRow } from '../../components/story';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

const FILTERS: Array<{ id: string; label: string; types?: SearchEntityType[] }> = [
  { id: 'all', label: 'All' },
  { id: 'news', label: 'News', types: ['Article', 'BreakingUpdate'] },
  { id: 'watch', label: 'Watch', types: ['Programme', 'Episode'] },
  { id: 'opportunities', label: 'Opportunities', types: ['Opportunity'] },
  { id: 'events', label: 'Events', types: ['Event'] },
  { id: 'guide', label: 'Guide', types: ['Vendor'] },
  { id: 'campus', label: 'Campus', types: ['Campus', 'University'] },
];

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const filter = FILTERS.find((item) => item.id === params.type) ?? FILTERS[0]!;
  const campusSlug = await getPreferredCampusSlug();

  let result = null;
  let searchError: string | null = null;

  if (q) {
    try {
      result = await searchAdapter.search({
        query: q,
        contentTypes: filter.types,
        campusSlug: campusSlug ?? undefined,
        limit: 30,
      });
    } catch (error) {
      searchError = error instanceof Error ? error.message : 'Search unavailable';
    }
  }

  return (
    <PublicChrome activePath="/search">
      <SectionHead title="Search" />
      <p className="c360-lede">
        Entity-aware search across news, breaking, campuses, programmes and episodes.
      </p>

      <form className="c360-panel c360-stack" action="/search" method="get">
        <div className="c360-field">
          <label htmlFor="q">Query</label>
          <input id="q" name="q" defaultValue={q} placeholder="Makerere, Hotseat, guild…" required />
        </div>
        <input type="hidden" name="type" value={filter.id} />
        <button className="c360-button" type="submit">
          Search
        </button>
      </form>

      <div className="c360-filter-row" style={{ marginTop: 16 }}>
        {FILTERS.map((item) => (
          <a
            key={item.id}
            className={item.id === filter.id ? 'is-active' : undefined}
            aria-current={item.id === filter.id ? 'page' : undefined}
            href={q ? `/search?q=${encodeURIComponent(q)}&type=${item.id}` : `/search?type=${item.id}`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {searchError ? (
        <div className="c360-panel" style={{ marginTop: 24 }}>
          <p className="c360-label">Search unavailable</p>
          <p className="c360-meta">The rest of the site still works. Try again shortly.</p>
        </div>
      ) : null}

      {result ? (
        <section style={{ marginTop: 32 }}>
          <p className="c360-meta" style={{ marginBottom: 16 }}>
            {result.total} result{result.total === 1 ? '' : 's'}
            {campusSlug ? ` · campus preference ${campusSlug}` : ''}
          </p>
          {result.total === 0 ? (
            <p className="c360-lede">No results for “{q}”.</p>
          ) : (
            <div className="c360-story-rows">
              {result.hits.map((hit) => (
                <StoryRow
                  key={`${hit.type}-${hit.id}`}
                  href={hit.url}
                  title={hit.title}
                  kicker={hit.type}
                  deck={hit.summary}
                  placeholder={hit.type === 'Episode' || hit.type === 'Programme' ? 'watch' : 'story'}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </PublicChrome>
  );
}
