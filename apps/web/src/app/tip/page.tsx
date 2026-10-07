import { PublicChrome } from '../../components/public-chrome';
import { submitTipAction } from './actions';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ sent?: string }> };

export default async function TipPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <PublicChrome activePath="/">
      <p className="c360-kicker">Newsroom</p>
      <h1 className="c360-title">Submit a tip</h1>
      <p className="c360-lede">
        Share something happening on campus. Tips are reviewed by editors — they are not published
        automatically. Do not include private source identities here if secrecy is required; contact
        the newsroom directly.
      </p>

      {params.sent === '1' ? (
        <div className="c360-panel" style={{ marginBottom: 24 }}>
          <p className="c360-meta" style={{ margin: 0 }}>
            Thanks — editors received your tip.
          </p>
        </div>
      ) : null}

      <form action={submitTipAction} className="c360-panel c360-stack">
        <div className="c360-field">
          <label htmlFor="message">What should we know?</label>
          <textarea id="message" name="message" required minLength={20} rows={6} />
        </div>
        <div className="c360-field">
          <label htmlFor="campusHint">Campus (optional)</label>
          <input id="campusHint" name="campusHint" />
        </div>
        <div className="c360-field">
          <label htmlFor="contactOptional">Contact if we may follow up (optional)</label>
          <input id="contactOptional" name="contactOptional" />
        </div>
        <button className="c360-button" type="submit">
          Send tip
        </button>
      </form>
    </PublicChrome>
  );
}
