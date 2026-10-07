import { getControlOverview } from '@campus360/content/control';
import { DashAction, DashStat, Icon } from '@campus360/ui/icons';
import { ControlChrome } from '../components/control-chrome';
import { can, requireControlUser } from '../lib/session';

export const dynamic = 'force-dynamic';

export default async function ControlOverviewPage() {
  const { actor, profile, user } = await requireControlUser();
  const overview = await getControlOverview(actor);

  return (
    <ControlChrome actor={actor} activePath="/">
      <div className="c360-dash-hero">
        <div>
          <p className="c360-kicker">Overview</p>
          <h1 className="c360-title">360 Control dashboard</h1>
          <p className="c360-dash-hero__meta">
            {profile.fullName ?? user.email} · <strong>{actor.role}</strong> · status, anomalies,
            then action
          </p>
        </div>
      </div>

      <div className="c360-dash-grid">
        <DashStat
          label="Published"
          value={overview.publishedArticles}
          hint={`${overview.inReview} in review`}
          icon="newspaper"
          href="/editorial"
          tone="ok"
        />
        <DashStat
          label="Campaigns"
          value={overview.liveCampaigns}
          hint={
            overview.overdueDeliverables > 0
              ? `${overview.overdueDeliverables} overdue deliverables`
              : 'Deliverables on track'
          }
          icon="star"
          href="/campaigns"
          tone={overview.overdueDeliverables > 0 ? 'warn' : 'default'}
        />
        <DashStat
          label="Open leads"
          value={overview.openLeads}
          hint="Commercial pipeline"
          icon="handshake"
          href="/leads"
        />
        <DashStat
          label="Guide vendors"
          value={overview.activeVendors}
          hint={`${overview.pendingVendors} pending review`}
          icon="map"
          href="/vendors"
          tone={overview.pendingVendors > 0 ? 'warn' : 'default'}
        />
      </div>

      <div className="c360-dash-grid">
        <DashStat
          label="Opportunities"
          value={overview.activeOpportunities}
          hint="Open listings"
          icon="badge"
          href="/editorial"
        />
        <DashStat
          label="Scheduled"
          value={overview.scheduledDueSoon}
          hint="Due within 7 days"
          icon="clock"
          href="/editorial"
        />
        <DashStat
          label="Failed jobs"
          value={overview.failedJobsWeek}
          hint="Last 7 days"
          icon="drive"
          href="/jobs"
          tone={overview.failedJobsWeek > 0 ? 'warn' : 'ok'}
        />
        <DashStat
          label="In review"
          value={overview.inReview}
          hint="Editorial backlog"
          icon="eye"
          href="/editorial"
          tone={overview.inReview > 0 ? 'warn' : 'default'}
        />
      </div>

      <div className="c360-dash-actions">
        {can(actor, 'campaign.manage') ? (
          <DashAction href="/campaigns" label="Campaigns" icon="star" primary />
        ) : null}
        {can(actor, 'campaign.manage') ? (
          <DashAction href="/leads" label="Leads" icon="handshake" />
        ) : null}
        {can(actor, 'vendor.approve') || can(actor, 'campaign.manage') ? (
          <DashAction href="/vendors" label="Vendor ops" icon="map" />
        ) : null}
        {can(actor, 'control.overview') ? (
          <DashAction href="/editorial" label="Editorial health" icon="newspaper" />
        ) : null}
        {can(actor, 'users.manage') ? (
          <DashAction href="/people" label="People & access" icon="users" />
        ) : null}
        {can(actor, 'platform.health.view') ? (
          <DashAction href="/health" label="Platform health" icon="drive" />
        ) : null}
        {can(actor, 'audit.view') ? (
          <DashAction href="/audit" label="Audit log" icon="file" />
        ) : null}
      </div>

      <div className="c360-dash-panels">
        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="file" /> Recent audit
            </h2>
            {can(actor, 'audit.view') ? <a href="/audit">Full log</a> : null}
          </div>
          {overview.recentAudit.length === 0 ? (
            <p className="c360-dash-empty">No audit events yet.</p>
          ) : (
            <ul className="c360-dash-list">
              {overview.recentAudit.map((item) => (
                <li key={item.id}>
                  <strong>{item.action}</strong>
                  <span className="c360-meta">
                    {item.actor?.email ?? 'system'} · {item.entityType ?? '—'} ·{' '}
                    {item.createdAt.toISOString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="c360-dash-panel">
          <div className="c360-dash-panel__head">
            <h2 className="c360-dash-panel__title">
              <Icon name="bell" /> Attention
            </h2>
          </div>
          <ul className="c360-dash-list">
            {overview.overdueDeliverables > 0 ? (
              <li>
                <strong>{overview.overdueDeliverables} overdue deliverables</strong>
                <span className="c360-meta">
                  Open <a href="/campaigns">Campaigns</a> and chase owners.
                </span>
              </li>
            ) : (
              <li>
                <strong>Deliverables healthy</strong>
                <span className="c360-meta">No overdue commercial commitments.</span>
              </li>
            )}
            {overview.pendingVendors > 0 ? (
              <li>
                <strong>{overview.pendingVendors} vendors pending</strong>
                <span className="c360-meta">
                  Review in <a href="/vendors">Vendor ops</a>.
                </span>
              </li>
            ) : (
              <li>
                <strong>Vendor queue clear</strong>
                <span className="c360-meta">No pending Campus Guide listings.</span>
              </li>
            )}
            {overview.failedJobsWeek > 0 ? (
              <li>
                <strong>{overview.failedJobsWeek} failed jobs this week</strong>
                <span className="c360-meta">
                  Check <a href="/jobs">Jobs</a> and retry if safe.
                </span>
              </li>
            ) : (
              <li>
                <strong>Jobs stable</strong>
                <span className="c360-meta">No failed runs in the last 7 days.</span>
              </li>
            )}
            {overview.recentOpsErrors > 0 ? (
              <li>
                <strong>{overview.recentOpsErrors} operational errors this week</strong>
                <span className="c360-meta">
                  Review detail in <a href="/health">Health</a> — users never see these codes.
                </span>
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </ControlChrome>
  );
}
