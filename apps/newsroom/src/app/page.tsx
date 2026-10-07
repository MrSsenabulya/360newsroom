import {
  listBreakingInbox,
  listEditorialArticles,
  listEditorialBreaking,
  listReviewQueue,
} from '@campus360/content/editorial';
import { DashAction, DashStat, Icon } from '@campus360/ui/icons';
import { NewsroomChrome } from '../components/newsroom-chrome';
import { can, requireNewsroomUser } from '../lib/session';

export const dynamic = 'force-dynamic';

export default async function NewsroomHomePage() {
  const { user, actor } = await requireNewsroomUser();
  const [articles, breaking] = await Promise.all([
    listEditorialArticles(actor),
    listEditorialBreaking(actor),
  ]);

  const review = can(actor, 'editorial.review') ? await listReviewQueue(actor) : [];
  const breakingInbox = can(actor, 'breaking.review') ? await listBreakingInbox(actor) : [];

  const drafts = articles.filter((item) => item.workflowStatus === 'DRAFT').length;
  const inReview = articles.filter((item) => item.workflowStatus === 'IN_REVIEW').length;
  const published = articles.filter((item) => item.workflowStatus === 'PUBLISHED').length;
  const developing = breaking.filter((item) => item.developmentState === 'DEVELOPING').length;

  const recentArticles = articles.slice(0, 6);
  const urgent = breakingInbox.slice(0, 5);

  return (
    <NewsroomChrome actor={actor} activePath="/">
      <div className="c360-dash-hero">
        <div>
          <p className="c360-kicker">My Desk</p>
          <h1 className="c360-title">Newsroom dashboard</h1>
          <p className="c360-dash-hero__meta">
            {user.email} · <strong>{actor.role}</strong>
            {actor.campusIds.length > 0 ? ` · ${actor.campusIds.length} campus scope(s)` : ' · network-wide'}
          </p>
        </div>
      </div>

      <div className="c360-dash-grid">
        <DashStat
          label="Drafts"
          value={drafts}
          hint="Articles still with authors"
          icon="edit"
          href="/articles"
        />
        <DashStat
          label="In review"
          value={inReview}
          hint="Waiting on editors"
          icon="eye"
          href="/review"
          tone={inReview > 0 ? 'warn' : 'default'}
        />
        <DashStat
          label="Published"
          value={published}
          hint="Live on public web"
          icon="check"
          href="/articles"
          tone="ok"
        />
        <DashStat
          label="Breaking desk"
          value={breakingInbox.length || developing}
          hint={`${breaking.length} total breaking items`}
          icon="bell"
          href="/breaking"
          tone={breakingInbox.length > 0 ? 'warn' : 'default'}
        />
      </div>

      <div className="c360-dash-actions">
        {can(actor, 'breaking.submit') ? (
          <DashAction href="/breaking/new" label="Submit Breaking" icon="bell" primary />
        ) : null}
        {can(actor, 'editorial.create') ? (
          <DashAction href="/articles/new" label="New Article" icon="plus" />
        ) : null}
        {can(actor, 'editorial.review') ? (
          <DashAction href="/review" label="Review Queue" icon="clipboard" />
        ) : null}
        {can(actor, 'editorial.create') ? (
          <DashAction href="/opportunities" label="Opportunities" icon="handshake" />
        ) : null}
        <DashAction href="/events" label="Events" icon="calendar" />
        <DashAction href="/guide" label="Campus Guide" icon="map" />
      </div>

      <div className="c360-dash-panels">
        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="bell" /> Urgent breaking
            </h2>
            <a href="/breaking">Open desk</a>
          </div>
          {urgent.length === 0 ? (
            <p className="c360-dash-empty">No breaking items awaiting verification.</p>
          ) : (
            <ul className="c360-dash-list">
              {urgent.map((item) => (
                <li key={item.id}>
                  <strong>{item.headline}</strong>
                  <span className="c360-meta">
                    {item.campus?.name ?? 'No campus'} · {item.priority} · {item.developmentState}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="newspaper" /> Recent articles
            </h2>
            <a href="/articles">All articles</a>
          </div>
          {recentArticles.length === 0 ? (
            <p className="c360-dash-empty">No articles in your scope yet.</p>
          ) : (
            <ul className="c360-dash-list">
              {recentArticles.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span className="c360-meta">
                    {item.workflowStatus} · {item.editorialRisk}
                    {item.campuses[0]?.campus?.name ? ` · ${item.campuses[0].campus.name}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="clipboard" /> Review queue
            </h2>
            {can(actor, 'editorial.review') ? <a href="/review">Open queue</a> : null}
          </div>
          {!can(actor, 'editorial.review') ? (
            <p className="c360-dash-empty">Your role submits work; editors clear the queue.</p>
          ) : review.length === 0 ? (
            <p className="c360-dash-empty">Queue is clear.</p>
          ) : (
            <ul className="c360-dash-list">
              {review.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span className="c360-meta">
                    {item.workflowStatus} · {item.editorialRisk}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="star" /> Focus today
            </h2>
          </div>
          <ul className="c360-dash-list">
            <li>
              <strong>Breaking first</strong>
              <span className="c360-meta">Publish verified updates faster than long-form.</span>
            </li>
            <li>
              <strong>Escalate high risk</strong>
              <span className="c360-meta">Legal, safety, and reputation stories need senior eyes.</span>
            </li>
            <li>
              <strong>Keep sources private</strong>
              <span className="c360-meta">Never paste private notes into public body fields.</span>
            </li>
          </ul>
        </section>
      </div>
    </NewsroomChrome>
  );
}
