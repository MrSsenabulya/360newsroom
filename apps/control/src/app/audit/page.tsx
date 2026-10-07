import { listAuditEvents } from '@campus360/content/control';
import { ControlChrome } from '../../components/control-chrome';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'audit.view')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Audit requires audit.view.</p>
      </ControlChrome>
    );
  }

  const events = await listAuditEvents(actor, 80);

  return (
    <ControlChrome actor={actor} activePath="/audit">
      <p className="c360-kicker">System</p>
      <h1 className="c360-title">Audit</h1>
      <ul className="c360-list" style={{ marginTop: 24 }}>
        {events.map((item) => (
          <li key={item.id} className="c360-list__item">
            <strong>{item.action}</strong>
            <p className="c360-meta">
              {item.actor?.email ?? 'system'} · {item.entityType ?? '—'} / {item.entityId ?? '—'} ·{' '}
              {item.createdAt.toISOString()}
            </p>
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}
