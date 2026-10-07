import { getCampaign } from '@campus360/content/commercial';
import { ControlChrome } from '../../../components/control-chrome';
import {
  addDeliverableAction,
  updateCampaignStatusAction,
  updateDeliverableStatusAction,
} from '../../actions';
import { can, requireControlUser } from '../../../lib/session';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function CampaignDetailPage({ params }: Props) {
  const { actor } = await requireControlUser();
  if (!can(actor, 'campaign.manage')) notFound();

  const { id } = await params;
  const campaign = await getCampaign(actor, id);

  return (
    <ControlChrome actor={actor} activePath="/campaigns">
      <p className="c360-kicker">{campaign.sponsor.organisation.name}</p>
      <h1 className="c360-title">{campaign.name}</h1>
      <p className="c360-meta">
        {campaign.status}
        {campaign.contractValue ? ` · contract ${campaign.contractValue}` : ''}
      </p>
      {campaign.objectives ? <p className="c360-lede">{campaign.objectives}</p> : null}

      <form action={updateCampaignStatusAction} className="c360-actions" style={{ marginTop: 16 }}>
        <input type="hidden" name="campaignId" value={campaign.id} />
        <select name="status" defaultValue={campaign.status}>
          {[
            'LEAD',
            'PROPOSAL',
            'CONTRACTED',
            'SETUP',
            'SCHEDULED',
            'LIVE',
            'PAUSED',
            'COMPLETED',
            'REPORTED',
            'RENEWAL',
            'CANCELLED',
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button className="c360-button" type="submit">
          Update status
        </button>
      </form>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.125rem' }}>Deliverables</h2>
        <p className="c360-meta">Commercial monitors progress — does not edit journalism.</p>
        <ul className="c360-list">
          {campaign.deliverables.map((item) => (
            <li key={item.id} className="c360-list__item">
              <strong>{item.title}</strong>
              <p className="c360-meta">
                {item.deliverableType} · {item.status}
                {item.dueAt ? ` · due ${item.dueAt.toISOString().slice(0, 10)}` : ''}
              </p>
              <form action={updateDeliverableStatusAction} className="c360-actions">
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="deliverableId" value={item.id} />
                <select name="status" defaultValue={item.status}>
                  {[
                    'PLANNED',
                    'BRIEFED',
                    'IN_PROGRESS',
                    'IN_REVIEW',
                    'DELIVERED',
                    'LIVE',
                    'REPORTED',
                    'CANCELLED',
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="c360-button c360-button--ghost" type="submit">
                  Update
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={addDeliverableAction} className="c360-panel c360-stack" style={{ marginTop: 24 }}>
          <p className="c360-kicker">Add deliverable</p>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <div className="c360-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>
          <div className="c360-field">
            <label htmlFor="deliverableType">Type</label>
            <select id="deliverableType" name="deliverableType" defaultValue="HOMEPAGE_FEATURE">
              <option value="HOMEPAGE_FEATURE">Homepage feature</option>
              <option value="PROGRAMME_SPONSOR">Programme sponsor</option>
              <option value="ARTICLE_SPONSOR">Article sponsor</option>
              <option value="EVENT_SPONSOR">Event sponsor</option>
              <option value="OPPORTUNITY_SPONSOR">Opportunity sponsor</option>
              <option value="VENDOR_FEATURE">Vendor feature</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="c360-field">
            <label htmlFor="dueAt">Due</label>
            <input id="dueAt" name="dueAt" type="date" />
          </div>
          <div className="c360-field">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" />
          </div>
          <button className="c360-button" type="submit">
            Add deliverable
          </button>
        </form>
      </section>
    </ControlChrome>
  );
}
