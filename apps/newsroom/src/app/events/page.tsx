import { listEditorialEvents } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { createEventAction, deleteEventAction, publishEventAction } from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../components/confirm-submit';
import { EditorialRichText } from '../../components/editorial-rich-text';

export const dynamic = 'force-dynamic';

export default async function EventsDeskPage() {
  const { actor } = await requireNewsroomUser();
  const items = await listEditorialEvents(actor);
  const { campuses, universities } = await listGeographyOptions(actor);

  return (
    <NewsroomChrome actor={actor} activePath="/events">
      <p className="c360-kicker">Utility</p>
      <h1 className="c360-title">Events</h1>

      {can(actor, 'editorial.create') ? (
        <form action={createEventAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
          <p className="c360-kicker">New event</p>
          <div className="c360-field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required />
          </div>
          <EditorialRichText name="description" label="Description" />
          <div className="c360-field">
            <label htmlFor="eventType">Type</label>
            <select id="eventType" name="eventType" defaultValue="CULTURAL">
              <option value="CULTURAL">Cultural</option>
              <option value="CAREER">Career</option>
              <option value="ACADEMIC">Academic</option>
              <option value="SPORTS">Sports</option>
              <option value="CLUB">Club</option>
              <option value="UNIVERSITY">University</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="c360-field">
            <label htmlFor="startAt">Starts</label>
            <input id="startAt" name="startAt" type="datetime-local" required />
          </div>
          <div className="c360-field">
            <label htmlFor="endAt">Ends</label>
            <input id="endAt" name="endAt" type="datetime-local" />
          </div>
          <div className="c360-field">
            <label htmlFor="venue">Venue</label>
            <input id="venue" name="venue" />
          </div>
          <div className="c360-field">
            <label htmlFor="ticketUrl">Ticket / register URL</label>
            <input id="ticketUrl" name="ticketUrl" type="url" />
          </div>
          <div className="c360-field">
            <label htmlFor="organisationName">Organiser</label>
            <input id="organisationName" name="organisationName" />
          </div>
          <div className="c360-field">
            <label htmlFor="campusId">Campus</label>
            <select id="campusId" name="campusId" defaultValue="">
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
            <select id="universityId" name="universityId" defaultValue="">
              <option value="">Select university</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <button className="c360-button" type="submit">
            Save draft
          </button>
        </form>
      ) : null}

      <ul className="c360-list">
        {items.map((item) => (
          <li key={item.id} className="c360-list__item">
            <strong>{item.name}</strong>
            <p className="c360-meta">
              {item.lifecycleStatus} · {item.publicationStatus} · {item.startAt.toISOString()}
            </p>
            <div className="c360-actions">
              <a className="c360-button c360-button--ghost" href={`/events/${item.id}`}>
                Edit
              </a>
              {can(actor, 'editorial.publish') && item.publicationStatus !== 'PUBLISHED' ? (
                <form action={publishEventAction}>
                  <input type="hidden" name="eventId" value={item.id} />
                  <button className="c360-button c360-button--ghost" type="submit">
                    Publish
                  </button>
                </form>
              ) : null}
              <form action={deleteEventAction}>
                <input type="hidden" name="eventId" value={item.id} />
                <ConfirmSubmit
                  className="c360-button c360-button--ghost"
                  message={
                    item.publicationStatus === 'PUBLISHED'
                      ? 'Archive this event?'
                      : 'Delete this draft?'
                  }
                >
                  {item.publicationStatus === 'PUBLISHED' ? 'Archive' : 'Delete'}
                </ConfirmSubmit>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </NewsroomChrome>
  );
}
