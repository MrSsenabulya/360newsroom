import { listCampaigns, listSponsors } from '@campus360/content/commercial';
import { prisma } from '@campus360/db';
import { ControlChrome } from '../../components/control-chrome';
import { createCampaignAction } from '../actions';
import { can, requireControlUser } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const { actor } = await requireControlUser();
  if (!can(actor, 'campaign.manage')) {
    return (
      <ControlChrome actor={actor}>
        <p className="c360-lede">Campaigns require campaign.manage.</p>
      </ControlChrome>
    );
  }

  const [campaigns, sponsors, campuses] = await Promise.all([
    listCampaigns(actor),
    listSponsors(actor),
    prisma.campus.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <ControlChrome actor={actor} activePath="/campaigns">
      <p className="c360-kicker">Commercial</p>
      <h1 className="c360-title">Campaigns</h1>

      <form action={createCampaignAction} className="c360-panel c360-stack" style={{ marginBottom: 32 }}>
        <p className="c360-kicker">New campaign</p>
        <div className="c360-field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
        </div>
        <div className="c360-field">
          <label htmlFor="sponsorId">Sponsor</label>
          <select id="sponsorId" name="sponsorId" required defaultValue="">
            <option value="" disabled>
              Select sponsor
            </option>
            {sponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.organisation.name}
              </option>
            ))}
          </select>
        </div>
        <div className="c360-field">
          <label htmlFor="objectives">Objectives</label>
          <textarea id="objectives" name="objectives" />
        </div>
        <div className="c360-field">
          <label htmlFor="contractValue">Contract value (private)</label>
          <input id="contractValue" name="contractValue" placeholder="UGX / USD reference" />
        </div>
        <div className="c360-field">
          <label htmlFor="targetAudience">Target audience</label>
          <input id="targetAudience" name="targetAudience" />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus</label>
          <select id="campusId" name="campusId" defaultValue="">
            <option value="">Any / network</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name}
              </option>
            ))}
          </select>
        </div>
        <div className="c360-field">
          <label htmlFor="startAt">Start</label>
          <input id="startAt" name="startAt" type="date" />
        </div>
        <div className="c360-field">
          <label htmlFor="endAt">End</label>
          <input id="endAt" name="endAt" type="date" />
        </div>
        <button className="c360-button" type="submit">
          Create campaign
        </button>
      </form>

      <ul className="c360-list">
        {campaigns.map((campaign) => {
          const overdue = campaign.deliverables.filter(
            (d) => d.dueAt && d.dueAt < new Date() && !['DELIVERED', 'LIVE', 'REPORTED', 'CANCELLED'].includes(d.status),
          ).length;
          return (
            <li key={campaign.id} className="c360-list__item">
              <a href={`/campaigns/${campaign.id}`}>
                <strong>{campaign.name}</strong>
              </a>
              <p className="c360-meta">
                {campaign.status} · {campaign.sponsor.organisation.name} ·{' '}
                {campaign.deliverables.length} deliverables
                {overdue ? ` · ${overdue} overdue` : ''}
                {campaign.contractValue ? ' · value on file' : ''}
              </p>
            </li>
          );
        })}
      </ul>
    </ControlChrome>
  );
}
