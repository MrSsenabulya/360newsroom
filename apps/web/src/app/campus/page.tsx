import { listActiveCampuses } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome, getPreferredCampusSlug } from '../../components/public-chrome';
import { StoryTile } from '../../components/story';

export const dynamic = 'force-dynamic';

export default async function CampusIndexPage() {
  const preferred = await getPreferredCampusSlug();
  const campuses = await listActiveCampuses();

  return (
    <PublicChrome activePath="/campus">
      <SectionHead title="Campuses" />
      <p className="c360-lede">
        Campus context prioritises relevant stories without hiding the wider network. Your choice is
        saved on this device — open the menu to change it.
      </p>
      {preferred ? (
        <p className="c360-meta" style={{ marginBottom: 24 }}>
          Current preference: <a href={`/campus/${preferred}`}>{preferred}</a>
        </p>
      ) : null}

      {campuses.length === 0 ? (
        <p className="c360-meta">No active campuses yet.</p>
      ) : (
        <div className="c360-tile-grid c360-tile-grid--3">
          {campuses.map((campus) => (
            <StoryTile
              key={campus.id}
              href={`/campus/${campus.slug}`}
              title={campus.name}
              kicker={campus.university.name}
              deck={campus.locationLabel}
              meta={preferred === campus.slug ? 'SELECTED' : null}
              placeholder="utility"
              aspect="4x3"
            />
          ))}
        </div>
      )}
    </PublicChrome>
  );
}
