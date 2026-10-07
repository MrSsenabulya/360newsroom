import { listRecentJobRuns } from '@campus360/content/jobs';
import { ControlChrome } from '../../components/control-chrome';
import { runJobsTickAction } from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function ControlJobsPage() {
  const { actor } = await requireControlUser();
  const canRun = can(actor, 'platform.jobs.retry');
  const canView = canRun || can(actor, 'platform.health.view');
  if (!canView) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Jobs requires platform health or jobs retry.</p>
      </ControlChrome>
    );
  }

  const runs = await listRecentJobRuns(40);

  return (
    <ControlChrome actor={actor} activePath="/jobs">
      <p className="c360-kicker">Platform</p>
      <h1 className="c360-title">Jobs</h1>
      <p className="c360-lede">
        Utility tick: opportunities, events, banners, scheduled publish when permitted. Production
        cron hits <code>POST /api/jobs/tick</code> with <code>JOBS_CRON_SECRET</code>.
      </p>

      {canRun ? (
        <form action={runJobsTickAction} style={{ marginBottom: 24 }}>
          <button className="c360-button" type="submit">
            Run utility tick
          </button>
        </form>
      ) : null}

      <ul className="c360-list">
        {runs.map((run) => (
          <li key={run.id} className="c360-list__item">
            <strong>{run.jobName}</strong>
            <p className="c360-meta">
              {run.status} · {run.startedAt.toISOString()}
              {run.error ? ` · ${run.error}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}
