import { listActiveCampuses } from '@campus360/content/public';
import { PublicChrome } from '../../components/public-chrome';
import { submitAdvertiseAction } from './actions';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ sent?: string }> };

export default async function AdvertisePage({ searchParams }: Props) {
  const params = await searchParams;
  const campuses = await listActiveCampuses();

  return (
    <PublicChrome activePath="/">
      <p className="c360-kicker">Partner with Campus 360</p>
      <h1 className="c360-title">Advertise / sponsor</h1>
      <p className="c360-lede">
        Tell us what you want to reach — programmes, campus pages, opportunities, events or Guide.
        This creates a commercial lead for our team. No marketplace checkout.
      </p>

      {params.sent === '1' ? (
        <div className="c360-panel" style={{ marginBottom: 24 }}>
          <p className="c360-meta" style={{ margin: 0 }}>
            Thanks — we received your enquiry.
          </p>
        </div>
      ) : null}

      <form action={submitAdvertiseAction} className="c360-panel c360-stack">
        <div className="c360-field">
          <label htmlFor="organisationName">Organisation</label>
          <input id="organisationName" name="organisationName" required />
        </div>
        <div className="c360-field">
          <label htmlFor="contactName">Contact name</label>
          <input id="contactName" name="contactName" />
        </div>
        <div className="c360-field">
          <label htmlFor="contactEmail">Email</label>
          <input id="contactEmail" name="contactEmail" type="email" />
        </div>
        <div className="c360-field">
          <label htmlFor="contactPhone">Phone</label>
          <input id="contactPhone" name="contactPhone" />
        </div>
        <div className="c360-field">
          <label htmlFor="interest">Interest</label>
          <input
            id="interest"
            name="interest"
            required
            placeholder="Homepage feature, Hotseat, Fresher Guide…"
          />
        </div>
        <div className="c360-field">
          <label htmlFor="budgetRange">Budget range (optional)</label>
          <input id="budgetRange" name="budgetRange" />
        </div>
        <div className="c360-field">
          <label htmlFor="campusId">Campus focus</label>
          <select id="campusId" name="campusId" defaultValue="">
            <option value="">Network-wide</option>
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
        <button className="c360-button" type="submit">
          Send enquiry
        </button>
      </form>
    </PublicChrome>
  );
}
