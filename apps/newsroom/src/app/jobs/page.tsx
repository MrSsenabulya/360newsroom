import { listRecentJobRuns } from '@campus360/content/jobs';
import { runJobsTickAction } from '../actions';
import { can, requireNewsroomUser } from '../../lib/session';
import { NewsroomChrome } from '../../components/newsroom-chrome';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const { actor } = await requireNewsroomUser();
  const canRun = can(actor, 'platform.jobs.retry') || can(actor, 'editorial.publish');
  if (!canRun) {
    return (
      <NewsroomChrome actor={actor} activePath="/jobs">
        <p className="c360-lede">Jobs desk requires publish or platform.jobs.retry.</p>
      </NewsroomChrome>
    );
  }

  const runs = await listRecentJobRuns(30);

  return (
    <NewsroomChrome
      actor={actor}
      activePath="/jobs"
      footer={<>Temporal tick: expire opportunities, refresh events, banners, scheduled publish.</>}
    >
      <p className="c360-kicker">Platform</p>
      <h1 className="c360-title">Jobs</h1>
      <p className="c360-lede">
        Idempotent utility jobs. Run manually for now; wire to cron in launch hardening.
      </p>

      <form action={runJobsTickAction} style={{ marginBottom: 24 }}>
        <button className="c360-button" type="submit">
          Run utility tick
        </button>
      </form>

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
      {runs.length === 0 ? <p className="c360-meta">No runs yet.</p> : null}
    </NewsroomChrome>
  );
}
