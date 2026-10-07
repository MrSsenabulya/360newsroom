import { listEditorialArticles } from '@campus360/content/editorial';
import { deleteArticleAction, publishArticleAction, submitArticleAction } from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../components/confirm-submit';
import { FlashToast } from '../../components/flash-toast';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    published?: string;
    submitted?: string;
    removed?: string;
    error?: string;
  }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const query = await searchParams;
  const { actor } = await requireNewsroomUser();
  const articles = await listEditorialArticles(actor);
  const canPublish = can(actor, 'editorial.publish');
  const canSubmit = can(actor, 'editorial.submit');
  const canEdit = can(actor, 'editorial.editOwn') || can(actor, 'editorial.editAny');

  const success = query.error
    ? null
    : query.published
      ? `Published “${query.published}”.`
      : query.submitted
        ? 'Article submitted for review.'
        : query.removed
          ? 'Article removed.'
          : null;
  const error = query.error ?? null;

  return (
    <NewsroomChrome actor={actor} activePath="/articles">
      <FlashToast success={success} error={error} />
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Editorial</p>
          <h1 className="c360-title">Articles</h1>
        </div>
        {can(actor, 'editorial.create') ? (
          <a className="c360-button" href="/articles/new">
            New article
          </a>
        ) : null}
      </div>
      <table className="c360-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Workflow</th>
            <th>Risk</th>
            <th>Campus</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>
                <strong>{article.title}</strong>
                <div className="c360-meta">{article.slug}</div>
              </td>
              <td>
                {article.workflowStatus}
                <div className="c360-meta">{article.publicationStatus}</div>
              </td>
              <td>{article.editorialRisk}</td>
              <td>{article.campuses.map((row) => row.campus.name).join(', ') || '—'}</td>
              <td>
                <div className="c360-actions">
                  {canEdit || canPublish ? (
                    <a className="c360-button c360-button--ghost" href={`/articles/${article.id}`}>
                      Edit
                    </a>
                  ) : null}
                  {article.publicationStatus === 'PUBLISHED' ? (
                    <a
                      href={`http://localhost:3000/news/${article.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : null}
                  {canSubmit &&
                  (article.workflowStatus === 'DRAFT' ||
                    article.workflowStatus === 'CHANGES_REQUESTED') ? (
                    <form action={submitArticleAction}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <button className="c360-button c360-button--ghost" type="submit">
                        Submit for review
                      </button>
                    </form>
                  ) : null}
                  {canPublish &&
                  (article.workflowStatus === 'READY' ||
                    article.workflowStatus === 'SCHEDULED' ||
                    article.workflowStatus === 'DRAFT') ? (
                    <form action={publishArticleAction}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <button className="c360-button" type="submit">
                        {article.editorialRisk === 'HIGH' ? 'Publish (EIC)' : 'Publish'}
                      </button>
                    </form>
                  ) : null}
                  {(canEdit || canPublish) && article.workflowStatus !== 'ARCHIVED' ? (
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <ConfirmSubmit
                        className="c360-button c360-button--ghost"
                        message={
                          article.publicationStatus === 'PUBLISHED' ||
                          article.workflowStatus === 'SCHEDULED'
                            ? 'Archive this article from the public site?'
                            : 'Permanently delete this draft?'
                        }
                      >
                        {article.publicationStatus === 'PUBLISHED' ||
                        article.workflowStatus === 'SCHEDULED'
                          ? 'Archive'
                          : 'Delete'}
                      </ConfirmSubmit>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </NewsroomChrome>
  );
}
