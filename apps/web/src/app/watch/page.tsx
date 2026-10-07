import { listPublishedProgrammes } from '@campus360/content/public';
import { SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../components/public-chrome';
import { WatchCard } from '../../components/story';

export const dynamic = 'force-dynamic';

export default async function WatchPage() {
  const programmes = await listPublishedProgrammes();

  return (
    <PublicChrome activePath="/watch">
      <SectionHead title="Watch" />
      <p className="c360-lede">Original Campus 360 shows — programmes with identity, not a streaming wall.</p>

      <section className="c360-bleed-inverse" aria-label="Programmes">
        <div className="c360-bleed-inverse__inner">
          <SectionHead title="Programmes" inverse />
          {programmes.length === 0 ? (
            <p className="c360-meta" style={{ color: 'var(--c360-slate-300)' }}>
              No programmes published yet.
            </p>
          ) : (
            <div className="c360-watch-rail">
              {programmes.map((programme) => {
                const episode = programme.episodes[0];
                return (
                  <WatchCard
                    key={programme.id}
                    href={`/watch/programmes/${programme.slug}`}
                    title={programme.name}
                    kicker={
                      episode
                        ? `${programme.programmeType} · ${episode.title}`
                        : programme.programmeType
                    }
                    imageUrl={programme.coverUrl}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicChrome>
  );
}
