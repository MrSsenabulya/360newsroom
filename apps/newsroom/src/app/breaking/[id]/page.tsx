import {
  getEditorialBreaking,
  listGeographyOptions,
} from '@campus360/content/editorial';
import { deleteBreakingAction, updateBreakingAction } from '../../actions';
import { can, requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditBreakingPage({ params }: Props) {
  const { id } = await params;
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);

  let item;
  try {
    item = await getEditorialBreaking(actor, id);
  } catch {
    notFound();
  }

  const canEdit =
    can(actor, 'breaking.review') ||
    (can(actor, 'breaking.editOwn') && item.reporterId === actor.id);

  return (
    <NewsroomChrome actor={actor} activePath="/breaking">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Breaking</p>
          <h1 className="c360-title">Edit breaking</h1>
          <p className="c360-meta">
            {item.developmentState} · {item.publicationStatus}
          </p>
        </div>
        <a className="c360-button c360-button--ghost" href="/breaking">
          Back
        </a>
      </div>

      {canEdit ? (
        <form action={updateBreakingAction} className="c360-panel c360-stack">
          <input type="hidden" name="breakingId" value={item.id} />
          <div className="c360-field">
            <label htmlFor="headline">Headline</label>
            <input id="headline" name="headline" required defaultValue={item.headline} />
          </div>
          <div className="c360-field">
            <label htmlFor="shortUpdate">Short update</label>
            <textarea id="shortUpdate" name="shortUpdate" required defaultValue={item.shortUpdate} />
          </div>
          <div className="c360-field">
            <label htmlFor="sourceContext">Public source context</label>
            <input id="sourceContext" name="sourceContext" defaultValue={item.sourceContext ?? ''} />
          </div>
          <div className="c360-field">
            <label htmlFor="campusId">Campus</label>
            <select id="campusId" name="campusId" defaultValue={item.campusId ?? ''}>
              <option value="">Select campus</option>
              {campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
          <div className="c360-field">
            <label htmlFor="universityId">University</label>
            <select id="universityId" name="universityId" defaultValue={item.universityId ?? ''}>
              <option value="">Select university</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <label className="c360-meta">
            <input type="checkbox" name="bannerEnabled" defaultChecked={item.bannerEnabled} /> Banner
            enabled
          </label>
          <button className="c360-button" type="submit">
            Save
          </button>
        </form>
      ) : (
        <p className="c360-lede">You cannot edit this item.</p>
      )}

      {canEdit ? (
        <form action={deleteBreakingAction} className="c360-panel" style={{ marginTop: 24 }}>
          <input type="hidden" name="breakingId" value={item.id} />
          <ConfirmSubmit
            className="c360-button c360-button--ghost"
            message={
              item.publicationStatus === 'PUBLISHED'
                ? 'Archive this breaking update from the public site?'
                : 'Permanently delete this draft?'
            }
          >
            {item.publicationStatus === 'PUBLISHED' ? 'Archive' : 'Delete'}
          </ConfirmSubmit>
        </form>
      ) : null}
    </NewsroomChrome>
  );
}
