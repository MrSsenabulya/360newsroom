import { listLeads } from '@campus360/content/commercial';
import { prisma } from '@campus360/db';
import { ControlChrome } from '../../components/control-chrome';
import { createLeadAction, updateLeadStatusAction } from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'campaign.manage')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Leads require campaign.manage.</p>
      </ControlChrome>
    );
  }

  const [leads, campuses] = await Promise.all([
    listLeads(actor),
    prisma.campus.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <ControlChrome actor={actor} activePath="/leads">
      <p className="c360-kicker">Commercial</p>
      <h1 className="c360-title">Leads</h1>

      <form action={createLeadAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
        <p className="c360-kicker">Log lead</p>
        <div className="c360-field">
          <label htmlFor="organisationName">Organisation</label>
          <input id="organisationName" name="organisationName" required />
        </div>
        <div className="c360-field">
          <label htmlFor="contactName">Contact</label>
          <input id="contactName" name="contactName" />
        </div>
        <div className="c360-field">
          <label htmlFor="contactEmail">Email</label>
          <input id="contactEmail" name="contactEmail" type="email" />
        </div>
        <div className="c360-field">
          <label htmlFor="interest">Interest</label>
          <input id="interest" name="interest" required placeholder="Homepage feature, Hotseat…" />
        </div>
        <div className="c360-field">
          <label htmlFor="budgetRange">Budget range (private)</label>
          <input id="budgetRange" name="budgetRange" />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue="">
            <option value="">Network</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <div className="c360-field">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" />
        </div>
        <div className="c360-field">
          <label htmlFor="notes">Internal notes</label>
          <textarea id="notes" name="notes" />
        </div>
        <button className="c360-button" type="submit">
          Create lead
        </button>
      </form>

      <ul className="c360-list">
        {leads.map((lead) => (
          <li key={lead.id} className="c360-list__item">
            <strong>{lead.organisationName}</strong>
            <p className="c360-meta">
              {lead.status} · {lead.interest} · {lead.source}
              {lead.budgetRange ? ' · budget on file' : ''}
            </p>
            <form action={updateLeadStatusAction} className="c360-actions">
              <input type="hidden" name="leadId" value={lead.id} />
              <select name="status" defaultValue={lead.status}>
                {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'FOLLOW_UP'].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ),
                )}
              </select>
              <button className="c360-button c360-button--ghost" type="submit">
                Update
              </button>
            </form>
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}
