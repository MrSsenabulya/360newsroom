import { listGuideVendors, listVendorCategories } from '@campus360/content/public';
import { stripHtml } from '@campus360/content/sanitize';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryTile } from '../../components/story';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ category?: string }> };

export default async function GuidePage({ searchParams }: Props) {
  const params = await searchParams;
  const campusSlug = await getPreferredCampusSlug();
  const [categories, vendors] = await Promise.all([
    listVendorCategories(),
    listGuideVendors({ limit: 60, campusSlug, categorySlug: params.category ?? null }),
  ]);

  return (
    <PublicChrome activePath="/guide">
      <SectionHead title="Campus Guide" />
      <p className="c360-lede">
        Verified listings for food, hostels, printing and more. No marketplace checkout in V1 — call,
        WhatsApp or visit.
      </p>

      <div className="c360-filter-row">
        <a
          className={!params.category ? 'is-active' : undefined}
          aria-current={!params.category ? 'page' : undefined}
          href="/guide"
        >
          All
        </a>
        {categories.map((category) => (
          <a
            key={category.id}
            className={params.category === category.slug ? 'is-active' : undefined}
            aria-current={params.category === category.slug ? 'page' : undefined}
            href={`/guide?category=${category.slug}`}
          >
            {category.name}
          </a>
        ))}
      </div>

      {vendors.length === 0 ? (
        <p className="c360-meta">No Guide listings yet for this filter.</p>
      ) : (
        <div className="c360-tile-grid c360-tile-grid--3">
          {vendors.map((item) => (
            <StoryTile
              key={item.id}
              href={`/guide/${item.slug}`}
              title={item.businessName}
              kicker={item.categoryName ?? 'Service'}
              deck={stripHtml(item.description).slice(0, 120)}
              meta={[item.featured ? 'Featured' : null, item.verified ? 'Verified' : null]
                .filter(Boolean)
                .join(' · ')
                .toUpperCase() || null}
              placeholder="utility"
              aspect="1x1"
            />
          ))}
        </div>
      )}
    </PublicChrome>
  );
}
