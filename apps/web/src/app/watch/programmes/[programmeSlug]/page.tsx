import { getPublishedProgrammeBySlug } from '@campus360/content/public';
import { MediaFrame, SectionHead } from '@campus360/ui';
import { PublicChrome } from '../../../../components/public-chrome';
import { WatchCard } from '../../../../components/story';
import { ProseHtml } from '../../../../components/prose-html';
import { mediaUrl } from '../../../../lib/media';
import { formatWhen } from '../../../../lib/format';
import { stripHtml } from '@campus360/content/sanitize';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ programmeSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programmeSlug } = await params;
  const programme = await getPublishedProgrammeBySlug(programmeSlug);
  if (!programme) return { title: 'Programme · Campus 360' };
  return {
    title: `${programme.name} · Watch`,
    description: programme.description ? stripHtml(programme.description).slice(0, 160) : undefined,
  };
}

export default async function ProgrammePage({ params }: Props) {
  const { programmeSlug } = await params;
  const programme = await getPublishedProgrammeBySlug(programmeSlug);
  if (!programme) notFound();

  return (
    <PublicChrome activePath="/watch">
      <p className="c360-label">{programme.programmeType}</p>
      <h1 className="c360-title">{programme.name}</h1>
      {programme.description ? <ProseHtml html={programme.description} /> : null}

      <div style={{ maxWidth: 480, marginBottom: 32 }}>
        <MediaFrame src={mediaUrl(programme.coverUrl, 'watch')} alt="" aspect="16x9" />
      </div>

      <section className="c360-bleed-inverse" aria-label="Episodes">
        <div className="c360-bleed-inverse__inner">
          <SectionHead title="Episodes" inverse />
          <div className="c360-watch-rail">
            {programme.episodes.map((episode) => (
              <WatchCard
                key={episode.id}
                href={`/watch/programmes/${programme.slug}/${episode.slug}`}
                title={episode.title}
                kicker={
                  episode.episodeNumber
                    ? `Ep ${episode.episodeNumber} · ${formatWhen(episode.publishedAt)}`
                    : formatWhen(episode.publishedAt)
                }
                imageUrl={programme.coverUrl}
              />
            ))}
          </div>
          {programme.episodes.length === 0 ? (
            <p className="c360-meta" style={{ color: 'var(--c360-slate-300)' }}>
              No episodes yet.
            </p>
          ) : null}
        </div>
      </section>
    </PublicChrome>
  );
}
