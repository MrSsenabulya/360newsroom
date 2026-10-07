import {
  listEditorialArticles,
  listEditorialBreaking,
  listEditorialProgrammes,
} from '@campus360/content/editorial';
import {
  listEditorialEvents,
  listEditorialOpportunities,
  listEditorialVendors,
} from '@campus360/content/utility';
import { DashAction, DashStat, Icon } from '@campus360/ui/icons';
import { NewsroomChrome } from '../../components/newsroom-chrome';
import { can, requireNewsroomUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function EditorialHubPage() {
  const { actor } = await requireNewsroomUser();

  const [articles, breaking, opportunities, events, vendors, programmes] = await Promise.all([
    listEditorialArticles(actor).catch(() => []),
    listEditorialBreaking(actor).catch(() => []),
    listEditorialOpportunities(actor).catch(() => []),
    listEditorialEvents(actor).catch(() => []),
    listEditorialVendors(actor).catch(() => []),
    listEditorialProgrammes().catch(() => []),
  ]);

  return (
    <NewsroomChrome actor={actor} activePath="/editorial">
      <div className="c360-dash-hero">
        <div>
          <p className="c360-kicker">CMS</p>
          <h1 className="c360-title">Editorial</h1>
          <p className="c360-dash-hero__meta">
            Create, edit and archive all public site content. Use TipTap for long-form copy; upload
            images or paste URLs; episodes use unlisted YouTube.
          </p>
        </div>
      </div>

      <div className="c360-dash-grid">
        <DashStat label="Articles" value={articles.length} icon="newspaper" href="/articles" />
        <DashStat label="Breaking" value={breaking.length} icon="bell" href="/breaking" />
        <DashStat
          label="Opportunities"
          value={opportunities.length}
          icon="handshake"
          href="/opportunities"
        />
        <DashStat label="Events" value={events.length} icon="calendar" href="/events" />
        <DashStat label="Guide" value={vendors.length} icon="map" href="/guide" />
        <DashStat
          label="Programmes"
          value={programmes.length}
          icon="bookmark"
          href="/programmes"
        />
      </div>

      <div className="c360-dash-actions">
        {can(actor, 'editorial.create') ? (
          <DashAction href="/articles/new" label="New article" icon="newspaper" primary />
        ) : null}
        {can(actor, 'breaking.submit') ? (
          <DashAction href="/breaking/new" label="Submit breaking" icon="bell" />
        ) : null}
        {can(actor, 'editorial.create') ? (
          <DashAction href="/opportunities" label="Opportunities" icon="handshake" />
        ) : null}
        {can(actor, 'editorial.create') ? (
          <DashAction href="/events" label="Events" icon="calendar" />
        ) : null}
        <DashAction href="/guide" label="Guide" icon="map" />
        {can(actor, 'programme.manage') ? (
          <DashAction href="/programmes" label="Programmes" icon="bookmark" />
        ) : null}
      </div>

      <section className="c360-panel" style={{ marginTop: 24 }}>
        <h2 className="c360-dash-panel__title">
          <Icon name="file" /> Collections
        </h2>
        <ul className="c360-dash-list">
          <li>
            <strong>
              <a href="/articles">Articles</a>
            </strong>
            <span className="c360-meta">Journalism drafts, review, publish, archive</span>
          </li>
          <li>
            <strong>
              <a href="/breaking">Breaking</a>
            </strong>
            <span className="c360-meta">Fast lane updates and banners</span>
          </li>
          <li>
            <strong>
              <a href="/opportunities">Opportunities</a>
            </strong>
            <span className="c360-meta">Jobs, scholarships, listings</span>
          </li>
          <li>
            <strong>
              <a href="/events">Events</a>
            </strong>
            <span className="c360-meta">Campus calendar</span>
          </li>
          <li>
            <strong>
              <a href="/guide">Guide</a>
            </strong>
            <span className="c360-meta">Campus Guide vendors</span>
          </li>
          <li>
            <strong>
              <a href="/programmes">Programmes</a>
            </strong>
            <span className="c360-meta">Shows, synopses, YouTube episodes</span>
          </li>
        </ul>
      </section>
    </NewsroomChrome>
  );
}
