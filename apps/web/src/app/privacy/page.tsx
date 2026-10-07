import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Campus 360 handles personal data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Governance" title="Privacy">
      <p className="c360-lede">
        Campus 360 is built for campus information. We minimize personal data and do not require an
        account for reading, watching, searching, or browsing Opportunities, Events and Campus Guide.
      </p>
      <p>
        Campus preference may be stored locally (cookie / browser storage). Internal staff accounts
        use Supabase Auth. Commercial enquiries and tips may include contact details you choose to
        provide.
      </p>
      <p>
        We do not sell personal data. Analytics should remain purpose-limited and avoid unnecessary
        PII. Contact the team via <a href="/contact">Contact</a> for privacy requests.
      </p>
    </LegalPage>
  );
}
