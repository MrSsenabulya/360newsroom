import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { MediaUrlField } from '../../../components/media-url-field';
import { FlashToast } from '../../../components/flash-toast';
import { listGeographyOptions } from '@campus360/content/editorial';
import { createArticleAction } from '../../actions';
import { requireNewsroomUser } from '../../../lib/session';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewArticlePage({ searchParams }: Props) {
  const query = await searchParams;
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);
  const error = query.error ?? null;

  return (
    <NewsroomChrome actor={actor} activePath="/articles">
      <FlashToast error={error} />
      <p className="c360-kicker">Articles</p>
      <h1 className="c360-title">New article</h1>
      <form action={createArticleAction} className="c360-panel c360-stack">
        <div className="c360-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required />
        </div>
        <div className="c360-field">
          <label htmlFor="standfirst">Standfirst</label>
          <input id="standfirst" name="standfirst" />
        </div>
        <EditorialRichText name="body" label="Body" placeholder="Write the story…" />
        <MediaUrlField name="heroPublicUrl" label="Hero image" altName="heroAlt" />
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue="" required={actor.campusIds.length > 0}>
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
          <label htmlFor="editorialRisk">Editorial risk</label>
          <select id="editorialRisk" name="editorialRisk" defaultValue="LOW">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High (EIC publish only)</option>
          </select>
        </div>
        <button className="c360-button" type="submit">
          Save draft
        </button>
      </form>
    </NewsroomChrome>
  );
}
