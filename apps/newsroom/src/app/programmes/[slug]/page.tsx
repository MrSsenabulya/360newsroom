import { getEditorialProgramme } from '@campus360/content/editorial';
import {
  archiveEpisodeAction,
  createEpisodeAction,
  deleteProgrammeAction,
  updateEpisodeAction,
  updateProgrammeAction,
} from '../../actions';
import { can, requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { MediaUrlField } from '../../../components/media-url-field';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export default async function ProgrammeDetailPage({ params }: Props) {
  const { slug } = await params;
  const { actor } = await requireNewsroomUser();
  const canManage = can(actor, 'programme.manage');

  let programme;
  try {
    programme = await getEditorialProgramme(actor, slug);
  } catch {
    notFound();
  }

  return (
    <NewsroomChrome actor={actor} activePath="/programmes">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Programmes</p>
          <h1 className="c360-title">{programme.name}</h1>
          <p className="c360-meta">
            {programme.status} · {programme.programmeType} · {programme.slug}
          </p>
        </div>
        <a className="c360-button c360-button--ghost" href="/programmes">
          All programmes
        </a>
      </div>

      {canManage ? (
        <form action={updateProgrammeAction} className="c360-panel c360-stack">
          <input type="hidden" name="programmeId" value={programme.id} />
          <input type="hidden" name="slug" value={programme.slug} />
          <p className="c360-kicker">Edit programme</p>
          <div className="c360-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required defaultValue={programme.name} />
          </div>
          <EditorialRichText
            name="description"
            label="Synopsis"
            defaultValue={programme.description ?? ''}
            placeholder="Programme synopsis…"
          />
          <div className="c360-field">
            <label htmlFor="programmeType">Type</label>
            <select id="programmeType" name="programmeType" defaultValue={programme.programmeType}>
              <option value="NEWS">News</option>
              <option value="TALK">Talk</option>
              <option value="CULTURE">Culture</option>
              <option value="DOCS">Docs</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="c360-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={programme.status}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <MediaUrlField
            name="coverPublicUrl"
            label="Cover image"
            defaultValue={programme.cover?.publicUrl ?? ''}
          />
          <button className="c360-button" type="submit">
            Save programme
          </button>
        </form>
      ) : null}

      {canManage && programme.status !== 'ARCHIVED' ? (
        <form action={deleteProgrammeAction} className="c360-panel" style={{ marginTop: 16 }}>
          <input type="hidden" name="programmeId" value={programme.id} />
          <ConfirmSubmit
            className="c360-button c360-button--ghost"
            message="Archive or delete this programme and its episodes from public Watch?"
          >
            {programme.status === 'ACTIVE' ? 'Archive programme' : 'Delete programme'}
          </ConfirmSubmit>
        </form>
      ) : null}

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.25rem' }}>Episodes</h2>
        {programme.episodes.length === 0 ? (
          <p className="c360-meta">No episodes yet.</p>
        ) : (
          <div className="c360-stack" style={{ marginTop: 16 }}>
            {programme.episodes.map((episode) => (
              <div key={episode.id} className="c360-panel">
                {canManage ? (
                  <form action={updateEpisodeAction} className="c360-stack">
                    <input type="hidden" name="episodeId" value={episode.id} />
                    <input type="hidden" name="programmeSlug" value={programme.slug} />
                    <div className="c360-field">
                      <label htmlFor={`title-${episode.id}`}>Title</label>
                      <input
                        id={`title-${episode.id}`}
                        name="title"
                        required
                        defaultValue={episode.title}
                      />
                    </div>
                    <EditorialRichText
                      name="description"
                      label="Synopsis"
                      defaultValue={episode.description ?? ''}
                      placeholder="Episode synopsis…"
                    />
                    <div className="c360-field">
                      <label htmlFor={`videoUrl-${episode.id}`}>YouTube URL</label>
                      <input
                        id={`videoUrl-${episode.id}`}
                        name="videoUrl"
                        required
                        defaultValue={episode.videoUrl ?? ''}
                      />
                    </div>
                    <div className="c360-field">
                      <label htmlFor={`episodeNumber-${episode.id}`}>Episode number</label>
                      <input
                        id={`episodeNumber-${episode.id}`}
                        name="episodeNumber"
                        type="number"
                        min={1}
                        defaultValue={episode.episodeNumber ?? ''}
                      />
                    </div>
                    <MediaUrlField
                      name="thumbnailPublicUrl"
                      label="Thumbnail"
                      defaultValue={episode.thumbnail?.publicUrl ?? ''}
                    />
                    <label className="c360-meta">
                      <input
                        type="checkbox"
                        name="publish"
                        defaultChecked={episode.publicationStatus === 'PUBLISHED'}
                      />{' '}
                      Published on public Watch
                    </label>
                    <div className="c360-actions">
                      <button className="c360-button" type="submit">
                        Save episode
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <strong>{episode.title}</strong>
                    <p className="c360-meta">
                      {episode.publicationStatus} · {episode.videoUrl}
                    </p>
                  </>
                )}
                {canManage && episode.productionStatus !== 'ARCHIVED' ? (
                  <form action={archiveEpisodeAction} style={{ marginTop: 12 }}>
                    <input type="hidden" name="episodeId" value={episode.id} />
                    <input type="hidden" name="programmeSlug" value={programme.slug} />
                    <ConfirmSubmit
                      className="c360-button c360-button--ghost"
                      message="Archive this episode from public Watch?"
                    >
                      Archive episode
                    </ConfirmSubmit>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {canManage ? (
        <form action={createEpisodeAction} className="c360-panel c360-stack" style={{ marginTop: 32 }}>
          <input type="hidden" name="programmeId" value={programme.id} />
          <input type="hidden" name="programmeSlug" value={programme.slug} />
          <p className="c360-kicker">New episode</p>
          <div className="c360-field">
            <label htmlFor="new-title">Title</label>
            <input id="new-title" name="title" required />
          </div>
          <EditorialRichText name="description" label="Synopsis" placeholder="Episode synopsis…" />
          <div className="c360-field">
            <label htmlFor="new-videoUrl">YouTube URL</label>
            <input
              id="new-videoUrl"
              name="videoUrl"
              required
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </div>
          <div className="c360-field">
            <label htmlFor="new-episodeNumber">Episode number</label>
            <input id="new-episodeNumber" name="episodeNumber" type="number" min={1} />
          </div>
          <MediaUrlField name="thumbnailPublicUrl" label="Thumbnail" />
          <label className="c360-meta">
            <input type="checkbox" name="publish" defaultChecked /> Publish on public Watch
          </label>
          <button className="c360-button" type="submit">
            Add episode
          </button>
        </form>
      ) : null}
    </NewsroomChrome>
  );
}
