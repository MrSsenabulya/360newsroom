import { getPlatformHealth } from '@campus360/content/control';
import { StatusDot } from '@campus360/ui';
import { ControlChrome } from '../../components/control-chrome';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'platform.health.view')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Health requires platform.health.view.</p>
      </ControlChrome>
    );
  }

  const health = await getPlatformHealth(actor);

  return (
    <ControlChrome actor={actor} activePath="/health">
      <p className="c360-kicker">Platform</p>
      <h1 className="c360-title">Health</h1>

      <div className="c360-stack" style={{ marginTop: 24 }}>
        <div className="c360-panel">
          <StatusDot
            state={health.database === 'ok' ? 'ok' : 'down'}
            label={health.database === 'ok' ? 'Postgres ok' : `Postgres down: ${health.databaseDetail}`}
          />
        </div>
        <div className="c360-panel">
          <StatusDot
            state={health.search === 'ok' ? 'ok' : 'down'}
            label={
              health.search === 'ok'
                ? `Search ok (${health.searchProvider})`
                : `Search down: ${health.searchDetail}`
            }
          />
        </div>

        <section>
          <h2 style={{ fontSize: '1.125rem' }}>Recent errors</h2>
          <p className="c360-meta">
            Operator detail only. Public and Newsroom users see friendly copy, never these codes.
          </p>
          {health.recentErrors.length === 0 ? (
            <p className="c360-lede">No operational errors recorded.</p>
          ) : (
            <ul className="c360-list">
              {health.recentErrors.map((event) => (
                <li key={event.id} className="c360-list__item">
                  <strong>
                    [{event.severity}] {event.message}
                  </strong>
                  <p className="c360-meta">
                    {event.surface} · {event.createdAt.toISOString()}
                    {event.requestPath ? ` · ${event.requestPath}` : ''}
                    {event.actor?.email ? ` · ${event.actor.email}` : ''}
                  </p>
                  {event.detail ? <p className="c360-meta">{event.detail}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: '1.125rem' }}>Recent jobs</h2>
          <ul className="c360-list">
            {health.recentJobs.map((run) => (
              <li key={run.id} className="c360-list__item">
                <strong>{run.jobName}</strong>
                <p className="c360-meta">
                  {run.status} · {run.startedAt.toISOString()}
                  {run.error ? ` · ${run.error}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ControlChrome>
  );
}
