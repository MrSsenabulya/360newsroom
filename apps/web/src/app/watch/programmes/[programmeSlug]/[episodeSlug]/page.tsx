import { getPublishedEpisode } from '@campus360/content/public';
import { MediaFrame } from '@campus360/ui';
import { PublicChrome } from '../../../../../components/public-chrome';
import { ShareButtons } from '../../../../../components/share-buttons';
import { ProseHtml } from '../../../../../components/prose-html';
import { mediaUrl } from '../../../../../lib/media';
import { formatWhen } from '../../../../../lib/format';
import { stripHtml } from '@campus360/content/sanitize';
import { videoAdapter } from '@campus360/video';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ programmeSlug: string; episodeSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programmeSlug, episodeSlug } = await params;
  const episode = await getPublishedEpisode(programmeSlug, episodeSlug);
  if (!episode) return { title: 'Episode · Campus 360' };
  return {
    title: `${episode.title} · ${episode.programme.name}`,
    description: episode.description ? stripHtml(episode.description).slice(0, 160) : undefined,
  };
}

export default async function EpisodePage({ params }: Props) {
  const { programmeSlug, episodeSlug } = await params;
  const episode = await getPublishedEpisode(programmeSlug, episodeSlug);
  if (!episode) notFound();

  const playback = videoAdapter.parse(episode.videoUrl);

  return (
    <PublicChrome activePath="/watch">
      <p className="c360-label">
        <a href={`/watch/programmes/${episode.programme.slug}`}>{episode.programme.name}</a>
      </p>
      <h1 className="c360-title">{episode.title}</h1>
      {episode.description ? <ProseHtml html={episode.description} /> : null}
      <p className="c360-meta">
        {episode.hosts.map((host) => host.name).join(', ')}
        {episode.publishedAt ? ` · ${formatWhen(episode.publishedAt)}` : ''}
        {episode.durationSec ? ` · ${Math.round(episode.durationSec / 60)} min` : ''}
      </p>
      <div style={{ margin: '16px 0 24px' }}>
        <ShareButtons
          title={episode.title}
          urlPath={`/watch/programmes/${programmeSlug}/${episodeSlug}`}
        />
      </div>

      {playback.provider === 'youtube' && playback.embedSrc ? (
        <div className="c360-player-frame">
          <iframe
            title={episode.title}
            src={playback.embedSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <>
          <MediaFrame src={mediaUrl(episode.thumbnailUrl, 'watch')} alt="" aspect="16x9" />
          {episode.videoUrl ? (
            <p style={{ marginTop: 16 }}>
              <a className="c360-button" href={episode.videoUrl}>
                Open video
              </a>
            </p>
          ) : null}
        </>
      )}

      {episode.guests.length > 0 ? (
        <p className="c360-meta" style={{ marginTop: 16 }}>
          Guests: {episode.guests.map((guest) => guest.name).join(', ')}
        </p>
      ) : null}
      {episode.transcript ? (
        <>
          <hr className="c360-rule" />
          <h2 style={{ fontSize: '1.125rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Transcript
          </h2>
          <div className="c360-story-body">{episode.transcript}</div>
        </>
      ) : null}
    </PublicChrome>
  );
}
