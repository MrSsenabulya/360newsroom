import { listEditorialBreaking, listBreakingInbox } from '@campus360/content/editorial';
import {
  appendTimelineAction,
  deleteBreakingAction,
  publishBreakingAction,
} from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { ConfirmSubmit } from '../../components/confirm-submit';

export const dynamic = 'force-dynamic';

export default async function BreakingDeskPage() {
  const { actor } = await requireNewsroomUser();
  const items = await listEditorialBreaking(actor);
  const canPublish = can(actor, 'breaking.publish');
  const canEdit =
    can(actor, 'breaking.editOwn') || can(actor, 'breaking.review') || canPublish;
  const inbox = can(actor, 'breaking.review') ? await listBreakingInbox(actor) : [];

  return (
    <NewsroomChrome actor={actor} activePath="/breaking">
      <div className="c360-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          <p className="c360-kicker">Fast lane</p>
          <h1 className="c360-title">Breaking</h1>
        </div>
        {can(actor, 'breaking.submit') ? (
          <a className="c360-button" href="/breaking/new">
            Submit update
          </a>
        ) : null}
      </div>

      {!canPublish ? (
        <p className="c360-meta">
          Your role can submit Breaking for verification. Editors publish after review.
        </p>
      ) : null}

      {inbox.length > 0 ? (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.125rem' }}>Awaiting verification ({inbox.length})</h2>
        </section>
      ) : null}

      <div className="c360-stack">
        {items.map((item) => (
          <article key={item.id} className="c360-panel c360-stack">
            <div>
              <p className="c360-meta">
                {item.developmentState} · {item.publicationStatus} · {item.priority} ·{' '}
                {item.campus?.name ?? 'No campus'}
              </p>
              <h2 style={{ margin: '4px 0 8px', fontSize: '1.25rem' }}>{item.headline}</h2>
              <p style={{ margin: 0 }}>{item.shortUpdate}</p>
            </div>
            <div className="c360-actions">
              <a className="c360-button c360-button--ghost" href={`/breaking/${item.id}`}>
                Edit
              </a>
              {canPublish && item.publicationStatus !== 'PUBLISHED' ? (
                <form action={publishBreakingAction}>
                  <input type="hidden" name="breakingId" value={item.id} />
                  <button className="c360-button" type="submit">
                    Verify & publish
                  </button>
                </form>
              ) : null}
              {item.publicationStatus === 'PUBLISHED' ? (
                <a
                  className="c360-button c360-button--ghost"
                  href={`http://localhost:3000/breaking/${item.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open public page
                </a>
              ) : null}
              {canEdit && item.publicationStatus !== 'ARCHIVED' ? (
                <form action={deleteBreakingAction}>
                  <input type="hidden" name="breakingId" value={item.id} />
                  <ConfirmSubmit
                    className="c360-button c360-button--ghost"
                    message={
                      item.publicationStatus === 'PUBLISHED'
                        ? 'Archive this breaking update from the public site?'
                        : 'Permanently delete this breaking draft?'
                    }
                  >
                    {item.publicationStatus === 'PUBLISHED' ? 'Archive' : 'Delete'}
                  </ConfirmSubmit>
                </form>
              ) : null}
            </div>
            {(item.publicationStatus === 'PUBLISHED' || item.reporterId === actor.id) &&
            (can(actor, 'breaking.editOwn') || can(actor, 'breaking.review')) ? (
              <form action={appendTimelineAction} className="c360-stack">
                <input type="hidden" name="breakingId" value={item.id} />
                <div className="c360-field">
                  <label htmlFor={`update-${item.id}`}>Append timeline update</label>
                  <textarea id={`update-${item.id}`} name="body" required />
                </div>
                <button className="c360-button c360-button--ghost" type="submit">
                  Post update
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </NewsroomChrome>
  );
}
