import { listSponsors } from '@campus360/content/commercial';
import { ControlChrome } from '../../components/control-chrome';
import { createSponsorAction, updateSponsorStatusAction } from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function SponsorsPage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'campaign.manage')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Sponsors require campaign.manage.</p>
      </ControlChrome>
    );
  }

  const sponsors = await listSponsors(actor);

  return (
    <ControlChrome actor={actor} activePath="/sponsors">
      <p className="c360-kicker">Commercial</p>
      <h1 className="c360-title">Sponsors</h1>

      <form action={createSponsorAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
        <p className="c360-kicker">New sponsor</p>
        <div className="c360-field">
          <label htmlFor="organisationName">Organisation</label>
          <input id="organisationName" name="organisationName" required />
        </div>
        <div className="c360-field">
          <label htmlFor="organisationWebsite">Website</label>
          <input id="organisationWebsite" name="organisationWebsite" type="url" />
        </div>
        <div className="c360-field">
          <label htmlFor="commercialContact">Commercial contact (private)</label>
          <input id="commercialContact" name="commercialContact" />
        </div>
        <div className="c360-field">
          <label htmlFor="notes">Notes (private)</label>
          <textarea id="notes" name="notes" />
        </div>
        <button className="c360-button" type="submit">
          Create sponsor
        </button>
      </form>

      <ul className="c360-list">
        {sponsors.map((sponsor) => (
          <li key={sponsor.id} className="c360-list__item">
            <strong>{sponsor.organisation.name}</strong>
            <p className="c360-meta">
              {sponsor.status} · {sponsor.campaigns.length} campaigns
              {sponsor.commercialContact ? ` · contact on file` : ''}
            </p>
            <form action={updateSponsorStatusAction} className="c360-actions">
              <input type="hidden" name="sponsorId" value={sponsor.id} />
              <select name="status" defaultValue={sponsor.status}>
                <option value="PROSPECT">Prospect</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CHURNED">Churned</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <button className="c360-button c360-button--ghost" type="submit">
                Update status
              </button>
            </form>
          </li>
        ))}
      </ul>
    </ControlChrome>
  );
}
