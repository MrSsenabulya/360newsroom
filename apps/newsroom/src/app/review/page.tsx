import { listArticleSources, listReviewQueue } from '@campus360/content/editorial';
import {
  addSourceAction,
  advanceReviewAction,
  publishArticleAction,
  publishDueAction,
  requestChangesAction,
  scheduleArticleAction,
} from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReviewQueuePage() {
  const { actor } = await requireNewsroomUser();
  if (!can(actor, 'editorial.review')) {
    redirect('/');
  }

  const queue = await listReviewQueue(actor);
  const sourcesByArticle = Object.fromEntries(
    await Promise.all(
      queue.map(async (article) => [article.id, await listArticleSources(actor, article.id)] as const),
    ),
  );

  const canPublish = can(actor, 'editorial.publish');
  const canSchedule = can(actor, 'editorial.schedule');
  const canEscalate = can(actor, 'editorial.escalate');

  return (
    <NewsroomChrome actor={actor} activePath="/review">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Publishing</p>
          <h1 className="c360-title">Review Queue</h1>
        </div>
        {canPublish ? (
          <form action={publishDueAction}>
            <button className="c360-button c360-button--ghost" type="submit">
              Publish due scheduled
            </button>
          </form>
        ) : null}
      </div>

      <div className="c360-stack">
        {queue.map((article) => {
          const sources = sourcesByArticle[article.id] ?? [];
          return (
            <article key={article.id} className="c360-panel c360-stack">
              <div>
                <p className="c360-meta">
                  {article.workflowStatus} · risk {article.editorialRisk} ·{' '}
                  {article.createdBy?.email ?? 'unknown author'} ·{' '}
                  {article.campuses.map((row) => row.campus.name).join(', ') || 'No campus'}
                </p>
                <h2 style={{ margin: '4px 0 8px', fontSize: '1.25rem' }}>{article.title}</h2>
                {article.standfirst ? <p>{article.standfirst}</p> : null}
                {article.reviewNotes ? (
                  <p className="c360-meta">Notes: {article.reviewNotes}</p>
                ) : null}
              </div>

              <div className="c360-actions">
                {article.workflowStatus === 'IN_REVIEW' ? (
                  <>
                    <form action={advanceReviewAction}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <input type="hidden" name="to" value="VERIFICATION" />
                      <button className="c360-button" type="submit">
                        Send to verification
                      </button>
                    </form>
                    <form action={requestChangesAction} className="c360-actions">
                      <input type="hidden" name="articleId" value={article.id} />
                      <input name="note" placeholder="Changes needed…" required />
                      <button className="c360-button c360-button--ghost" type="submit">
                        Request changes
                      </button>
                    </form>
                  </>
                ) : null}

                {article.workflowStatus === 'VERIFICATION' ? (
                  <form action={advanceReviewAction}>
                    <input type="hidden" name="articleId" value={article.id} />
                    <input type="hidden" name="to" value="READY" />
                    <button className="c360-button" type="submit">
                      Mark ready
                    </button>
                  </form>
                ) : null}

                {article.workflowStatus === 'READY' && canSchedule ? (
                  <form action={scheduleArticleAction} className="c360-actions">
                    <input type="hidden" name="articleId" value={article.id} />
                    <input type="datetime-local" name="scheduledAt" required />
                    <button className="c360-button c360-button--ghost" type="submit">
                      Schedule
                    </button>
                  </form>
                ) : null}

                {(article.workflowStatus === 'READY' || article.workflowStatus === 'SCHEDULED') &&
                canPublish ? (
                  article.editorialRisk === 'HIGH' && !canEscalate ? (
                    <p className="c360-meta">High-risk — needs Editor-in-Chief</p>
                  ) : (
                    <form action={publishArticleAction}>
                      <input type="hidden" name="articleId" value={article.id} />
                      <button className="c360-button" type="submit">
                        Publish now
                      </button>
                    </form>
                  )
                ) : null}
              </div>

              <details>
                <summary>Sources ({sources.length}) — internal only</summary>
                <ul className="c360-list">
                  {sources.map((source) => (
                    <li key={source.id} className="c360-list__item">
                      <strong>{source.label}</strong>
                      <p className="c360-meta">
                        {source.type} · {source.verification}
                        {source.privateNotes ? ` · notes on file` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
                <form action={addSourceAction} className="c360-stack" style={{ marginTop: 12 }}>
                  <input type="hidden" name="articleId" value={article.id} />
                  <div className="c360-field">
                    <label htmlFor={`src-${article.id}`}>Source label</label>
                    <input id={`src-${article.id}`} name="label" required />
                  </div>
                  <div className="c360-field">
                    <label htmlFor={`id-${article.id}`}>Private identity (never public)</label>
                    <input id={`id-${article.id}`} name="privateIdentity" />
                  </div>
                  <div className="c360-field">
                    <label htmlFor={`notes-${article.id}`}>Private notes</label>
                    <textarea id={`notes-${article.id}`} name="privateNotes" />
                  </div>
                  <button className="c360-button c360-button--ghost" type="submit">
                    Add source
                  </button>
                </form>
              </details>
            </article>
          );
        })}
      </div>

      {queue.length === 0 ? <p className="c360-meta">Review queue is clear.</p> : null}
    </NewsroomChrome>
  );
}
