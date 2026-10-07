import { listEditorialProgrammes } from '@campus360/content/editorial';
import { createProgrammeAction } from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { EditorialRichText } from '../../components/editorial-rich-text';
import { MediaUrlField } from '../../components/media-url-field';

export const dynamic = 'force-dynamic';

export default async function ProgrammesPage() {
  const { actor } = await requireNewsroomUser();
  const programmes = await listEditorialProgrammes();
  const canManage = can(actor, 'programme.manage');

  return (
    <NewsroomChrome actor={actor} activePath="/programmes">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Watch</p>
          <h1 className="c360-title">Programmes</h1>
          <p className="c360-lede">
            Create programmes, add episode synopses and unlisted YouTube URLs for Public Watch.
          </p>
        </div>
      </div>

      {canManage ? (
        <form action={createProgrammeAction} className="c360-panel c360-stack" style={{ marginBottom: 24 }}>
          <p className="c360-kicker">New programme</p>
          <div className="c360-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required />
          </div>
          <EditorialRichText name="description" label="Synopsis" placeholder="Programme synopsis…" />
          <div className="c360-field">
            <label htmlFor="programmeType">Type</label>
            <select id="programmeType" name="programmeType" defaultValue="TALK">
              <option value="NEWS">News</option>
              <option value="TALK">Talk</option>
              <option value="CULTURE">Culture</option>
              <option value="DOCS">Docs</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="c360-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <MediaUrlField name="coverPublicUrl" label="Cover image" />
          <button className="c360-button" type="submit">
            Create programme
          </button>
        </form>
      ) : (
        <p className="c360-meta">View only — programme.manage required to edit.</p>
      )}

      <table className="c360-table">
        <thead>
          <tr>
            <th>Programme</th>
            <th>Status</th>
            <th>Episodes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {programmes.map((programme) => (
            <tr key={programme.id}>
              <td>
                <strong>{programme.name}</strong>
                <div className="c360-meta">{programme.slug}</div>
              </td>
              <td>{programme.status}</td>
              <td>{programme._count.episodes}</td>
              <td>
                {canManage ? (
                  <a className="c360-button c360-button--ghost" href={`/programmes/${programme.slug}`}>
                    Edit
                  </a>
                ) : (
                  <a href={`/programmes/${programme.slug}`}>View</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </NewsroomChrome>
  );
}
