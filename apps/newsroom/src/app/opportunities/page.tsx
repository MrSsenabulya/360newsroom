import { listEditorialOpportunities } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { EditorialRichText } from '../../components/editorial-rich-text';
import {
  createOpportunityAction,
  deleteOpportunityAction,
  publishOpportunityAction,
} from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../components/confirm-submit';

export const dynamic = 'force-dynamic';

export default async function OpportunitiesDeskPage() {
  const { actor } = await requireNewsroomUser();
  const items = await listEditorialOpportunities(actor);
  const { campuses, universities } = await listGeographyOptions(actor);

  return (
    <NewsroomChrome actor={actor} activePath="/opportunities">
      <p className="c360-kicker">Utility</p>
      <h1 className="c360-title">Opportunities</h1>

      {can(actor, 'editorial.create') ? (
        <form action={createOpportunityAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
          <p className="c360-kicker">New opportunity</p>
          <div className="c360-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>
          <div className="c360-field">
            <label htmlFor="organisationName">Organisation</label>
            <input id="organisationName" name="organisationName" />
          </div>
          <div className="c360-field">
            <label htmlFor="opportunityType">Type</label>
            <select id="opportunityType" name="opportunityType" defaultValue="INTERNSHIP">
              <option value="INTERNSHIP">Internship</option>
              <option value="GRADUATE_JOB">Graduate job</option>
              <option value="JOB">Job</option>
              <option value="SCHOLARSHIP">Scholarship</option>
              <option value="FELLOWSHIP">Fellowship</option>
              <option value="COMPETITION">Competition</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <EditorialRichText name="description" label="Description" placeholder="Eligibility, how to apply…" />
          <div className="c360-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" />
          </div>
          <div className="c360-field">
            <label htmlFor="deadline">Deadline</label>
            <input id="deadline" name="deadline" type="datetime-local" />
          </div>
          <div className="c360-field">
            <label htmlFor="applicationUrl">Application URL</label>
            <input id="applicationUrl" name="applicationUrl" type="url" />
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
            <strong>{item.title}</strong>
            <p className="c360-meta">
              {item.opportunityType} · {item.listingStatus} · {item.publicationStatus}
            </p>
            <div className="c360-actions">
              <a className="c360-button c360-button--ghost" href={`/opportunities/${item.id}`}>
                Edit
              </a>
              {can(actor, 'editorial.publish') && item.publicationStatus !== 'PUBLISHED' ? (
                <form action={publishOpportunityAction}>
                  <input type="hidden" name="opportunityId" value={item.id} />
                  <button className="c360-button c360-button--ghost" type="submit">
                    Publish
                  </button>
                </form>
              ) : null}
              <form action={deleteOpportunityAction}>
                <input type="hidden" name="opportunityId" value={item.id} />
                <ConfirmSubmit
                  className="c360-button c360-button--ghost"
                  message={
                    item.publicationStatus === 'PUBLISHED'
                      ? 'Archive this opportunity?'
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
