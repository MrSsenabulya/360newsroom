import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Standards',
  description: 'How Campus 360 approaches journalism and verification.',
};

export default function EditorialStandardsPage() {
  return (
    <LegalPage kicker="Governance" title="Editorial Standards">
      <p className="c360-lede">
        Campus 360 prioritizes speed on Breaking without sacrificing verification. Reporters and
        correspondents cannot publish Articles directly. High-risk stories escalate.
      </p>
      <p>
        We do not use AI-generated journalism. Sponsored content must be disclosed. Private source
        identities and internal notes never appear in public pages, Search, or analytics.
      </p>
      <p>
        See also <a href="/corrections">Corrections Policy</a>.
      </p>
    </LegalPage>
  );
}
