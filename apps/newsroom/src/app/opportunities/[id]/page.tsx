import { getEditorialOpportunity } from '@campus360/content/utility';
import { listGeographyOptions } from '@campus360/content/editorial';
import { deleteOpportunityAction, updateOpportunityAction } from '../../actions';
import { requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditOpportunityPage({ params }: Props) {
  const { id } = await params;
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);

  let item;
  try {
    item = await getEditorialOpportunity(actor, id);
  } catch {
    notFound();
  }

  const campusId = item.campuses[0]?.campusId ?? '';
  const deadlineLocal = item.deadline
    ? new Date(item.deadline.getTime() - item.deadline.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : '';

  return (
    <NewsroomChrome actor={actor} activePath="/opportunities">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Opportunities</p>
          <h1 className="c360-title">Edit opportunity</h1>
        </div>
        <a className="c360-button c360-button--ghost" href="/opportunities">
          Back
        </a>
      </div>

      <form action={updateOpportunityAction} className="c360-panel c360-stack">
        <input type="hidden" name="opportunityId" value={item.id} />
        <div className="c360-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required defaultValue={item.title} />
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
          <label htmlFor="opportunityType">Type</label>
          <select id="opportunityType" name="opportunityType" defaultValue={item.opportunityType}>
            <option value="INTERNSHIP">Internship</option>
            <option value="GRADUATE_JOB">Graduate job</option>
            <option value="JOB">Job</option>
            <option value="SCHOLARSHIP">Scholarship</option>
            <option value="FELLOWSHIP">Fellowship</option>
            <option value="COMPETITION">Competition</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <EditorialRichText
          name="description"
          label="Description"
          defaultValue={item.description}
        />
        <div className="c360-field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" defaultValue={item.location ?? ''} />
        </div>
        <div className="c360-field">
          <label htmlFor="deadline">Deadline</label>
          <input id="deadline" name="deadline" type="datetime-local" defaultValue={deadlineLocal} />
        </div>
        <div className="c360-field">
          <label htmlFor="applicationUrl">Application URL</label>
          <input
            id="applicationUrl"
            name="applicationUrl"
            type="url"
            defaultValue={item.applicationUrl ?? ''}
          />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue={campusId}>
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

      <form action={deleteOpportunityAction} className="c360-panel" style={{ marginTop: 24 }}>
        <input type="hidden" name="opportunityId" value={item.id} />
        <ConfirmSubmit
          className="c360-button c360-button--ghost"
          message={
            item.publicationStatus === 'PUBLISHED'
              ? 'Archive this opportunity from listings?'
              : 'Delete this draft?'
          }
        >
          {item.publicationStatus === 'PUBLISHED' ? 'Archive' : 'Delete'}
        </ConfirmSubmit>
      </form>
    </NewsroomChrome>
  );
}
