import { getEditorialHealth } from '@campus360/content/control';
import { ControlChrome } from '../../components/control-chrome';
import { requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function EditorialHealthPage() {
  const { actor } = await requireControlUser();
  const health = await getEditorialHealth(actor);

  return (
    <ControlChrome actor={actor} activePath="/editorial">
      <p className="c360-kicker">Operations</p>
      <h1 className="c360-title">Editorial health</h1>
      <p className="c360-lede">
        Observe queue pressure and scheduled publish. Editing stays in Newsroom.
      </p>

      <div className="c360-panel" style={{ marginTop: 24 }}>
        <p className="c360-kicker">Workflow counts</p>
        <ul className="c360-list">
          {health.byWorkflow.map((row) => (
            <li key={row.workflowStatus} className="c360-list__item">
              {row.workflowStatus}: {row._count._all}
            </li>
          ))}
        </ul>
        <p className="c360-meta">{health.breakingOpen} open breaking items</p>
      </div>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.125rem' }}>Scheduled monitor</h2>
        {health.scheduledQueue.length === 0 ? (
          <p className="c360-meta">No scheduled articles.</p>
        ) : (
          <ul className="c360-list">
            {health.scheduledQueue.map((item) => (
              <li key={item.id} className="c360-list__item">
                <strong>{item.title}</strong>
                <p className="c360-meta">
                  {item.scheduledAt?.toISOString() ?? 'no time'} · slug {item.slug}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="c360-meta" style={{ marginTop: 12 }}>
          Deep-link: open Newsroom Review / Articles to act.
        </p>
      </section>
    </ControlChrome>
  );
}
