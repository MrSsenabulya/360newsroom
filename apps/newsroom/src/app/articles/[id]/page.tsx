import {
  getEditorialArticle,
  listGeographyOptions,
} from '@campus360/content/editorial';
import { deleteArticleAction, updateArticleAction } from '../../actions';
import { can, requireNewsroomUser } from '../../../lib/session';
import { NewsroomChrome } from '../../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../../components/confirm-submit';
import { EditorialRichText } from '../../../components/editorial-rich-text';
import { MediaUrlField } from '../../../components/media-url-field';
import { FlashToast } from '../../../components/flash-toast';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const { actor } = await requireNewsroomUser();
  const { campuses, universities } = await listGeographyOptions(actor);

  let article;
  try {
    article = await getEditorialArticle(actor, id);
  } catch {
    notFound();
  }

  const canEdit =
    can(actor, 'editorial.editAny') ||
    can(actor, 'editorial.editOwn') ||
    can(actor, 'editorial.publish');
  const canRemove =
    can(actor, 'editorial.editAny') ||
    can(actor, 'editorial.editOwn') ||
    can(actor, 'editorial.publish');

  const campusId = article.campuses[0]?.campusId ?? '';

  const success =
    query.error != null
      ? null
      : query.created
        ? 'Article draft created.'
        : query.saved
          ? 'Article saved.'
          : null;
  const error = query.error ?? null;

  return (
    <NewsroomChrome actor={actor} activePath="/articles">
      <FlashToast success={success} error={error} />
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Articles</p>
          <h1 className="c360-title">Edit article</h1>
          <p className="c360-meta">
            {article.workflowStatus} · {article.publicationStatus} · {article.slug}
          </p>
        </div>
        <a className="c360-button c360-button--ghost" href="/articles">
          Back to list
        </a>
      </div>

      {canEdit ? (
        <form action={updateArticleAction} className="c360-panel c360-stack">
          <input type="hidden" name="articleId" value={article.id} />
          <div className="c360-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required defaultValue={article.title} />
          </div>
          <div className="c360-field">
            <label htmlFor="standfirst">Standfirst</label>
            <input id="standfirst" name="standfirst" defaultValue={article.standfirst ?? ''} />
          </div>
          <EditorialRichText
            name="body"
            label="Body"
            defaultValue={article.body}
            placeholder="Write the story…"
          />
          <MediaUrlField
            name="heroPublicUrl"
            label="Hero image"
            defaultValue={article.heroMedia?.publicUrl ?? ''}
            altName="heroAlt"
            altDefault={article.heroMedia?.altText ?? ''}
          />
          <div className="c360-field">
            <label htmlFor="campusId">Campus</label>
            <select
              id="campusId"
              name="campusId"
              defaultValue={campusId}
              required={actor.campusIds.length > 0}
            >
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
            <select id="universityId" name="universityId" defaultValue={article.universityId ?? ''}>
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
            <select id="editorialRisk" name="editorialRisk" defaultValue={article.editorialRisk}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High (EIC publish only)</option>
            </select>
          </div>
          <button className="c360-button" type="submit">
            Save changes
          </button>
        </form>
      ) : (
        <p className="c360-lede">You do not have permission to edit this article.</p>
      )}

      {canRemove ? (
        <form action={deleteArticleAction} className="c360-panel" style={{ marginTop: 24 }}>
          <input type="hidden" name="articleId" value={article.id} />
          <p className="c360-kicker">Remove</p>
          <p className="c360-meta">
            Drafts are deleted. Published or scheduled articles are archived and leave the public
            site.
          </p>
          <ConfirmSubmit
            className="c360-button c360-button--ghost"
            message={
              article.publicationStatus === 'PUBLISHED' || article.workflowStatus === 'SCHEDULED'
                ? 'Archive this article from the public site?'
                : 'Permanently delete this draft?'
            }
          >
            {article.publicationStatus === 'PUBLISHED' || article.workflowStatus === 'SCHEDULED'
              ? 'Archive from public site'
              : 'Delete draft'}
          </ConfirmSubmit>
        </form>
      ) : null}
    </NewsroomChrome>
  );
}
