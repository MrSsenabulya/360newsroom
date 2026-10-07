import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { listGeographyOptions } from '@campus360/content/editorial';
import { createBreakingAction } from '../../actions';
import { requireNewsroomUser } from '../../../lib/session';

export const dynamic = 'force-dynamic';

export default async function NewBreakingPage() {
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);

  return (
    <NewsroomChrome actor={actor} activePath="/breaking/new">
      <p className="c360-kicker">Breaking Fast Lane</p>
      <h1 className="c360-title">What happened?</h1>
      <p className="c360-lede">
        Phone-first field form. Editors verify before anything goes public. Private source
        contacts stay off this form — use public source context only.
      </p>
      <form action={createBreakingAction} className="c360-panel c360-stack">
        <div className="c360-field">
          <label htmlFor="headline">Headline</label>
          <input id="headline" name="headline" required autoComplete="off" />
        </div>
        <div className="c360-field">
          <label htmlFor="shortUpdate">Short update</label>
          <textarea id="shortUpdate" name="shortUpdate" required rows={4} />
        </div>
        <div className="c360-field">
          <label htmlFor="occurredAt">When (optional)</label>
          <input id="occurredAt" name="occurredAt" type="datetime-local" />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue="" required>
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
        <div className="c360-field">
          <label htmlFor="sourceContext">Public source context</label>
          <input
            id="sourceContext"
            name="sourceContext"
            placeholder="Guild notice board — never private phone numbers"
          />
        </div>
        <button className="c360-button" type="submit" style={{ minHeight: 48 }}>
          Submit for verification
        </button>
      </form>
    </NewsroomChrome>
  );
}
