import { getEditorialEvent } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { deleteEventAction, updateEventAction } from '../../actions';
import { requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { MediaUrlField } from '../../../components/media-url-field';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

function toLocalInput(value: Date | null | undefined) {
  if (!value) return '';
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);

  let item;
  try {
    item = await getEditorialEvent(actor, id);
  } catch {
    notFound();
  }

  return (
    <NewsroomChrome actor={actor} activePath="/events">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Events</p>
          <h1 className="c360-title">Edit event</h1>
        </div>
        <a className="c360-button c360-button--ghost" href="/events">
          Back
        </a>
      </div>

      <form action={updateEventAction} className="c360-panel c360-stack">
        <input type="hidden" name="eventId" value={item.id} />
        <div className="c360-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={item.name} />
        </div>
        <EditorialRichText name="description" label="Description" defaultValue={item.description} />
        <MediaUrlField
          name="posterPublicUrl"
          label="Poster image"
          defaultValue={item.poster?.publicUrl ?? ''}
        />
        <div className="c360-field">
          <label htmlFor="eventType">Type</label>
          <select id="eventType" name="eventType" defaultValue={item.eventType}>
            <option value="ACADEMIC">Academic</option>
            <option value="CAREER">Career</option>
            <option value="SPORTS">Sports</option>
            <option value="CULTURAL">Cultural</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="CLUB">Club</option>
            <option value="UNIVERSITY">University</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="c360-field">
          <label htmlFor="startAt">Starts</label>
          <input
            id="startAt"
            name="startAt"
            type="datetime-local"
            required
            defaultValue={toLocalInput(item.startAt)}
          />
        </div>
        <div className="c360-field">
          <label htmlFor="endAt">Ends</label>
          <input id="endAt" name="endAt" type="datetime-local" defaultValue={toLocalInput(item.endAt)} />
        </div>
        <div className="c360-field">
          <label htmlFor="venue">Venue</label>
          <input id="venue" name="venue" defaultValue={item.venue ?? ''} />
        </div>
        <div className="c360-field">
          <label htmlFor="organisationName">Organisation</label>
          <input
            id="organisationName"
            name="organisationName"
            defaultValue={item.organisation?.name ?? ''}
          />
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
        <button className="c360-button" type="submit">
          Save
        </button>
      </form>

      <form action={deleteEventAction} className="c360-panel" style={{ marginTop: 24 }}>
        <input type="hidden" name="eventId" value={item.id} />
        <ConfirmSubmit
          className="c360-button c360-button--ghost"
          message={
            item.publicationStatus === 'PUBLISHED'
              ? 'Archive/cancel this event on the public site?'
              : 'Delete this draft?'
          }
        >
          {item.publicationStatus === 'PUBLISHED' ? 'Archive' : 'Delete'}
        </ConfirmSubmit>
      </form>
    </NewsroomChrome>
  );
}
