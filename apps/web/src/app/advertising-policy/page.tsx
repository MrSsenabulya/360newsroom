import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advertising & Sponsored Policy',
  description: 'How Campus 360 separates journalism from commercial work.',
};

export default function AdvertisingPolicyPage() {
  return (
    <LegalPage kicker="Governance" title="Advertising & Sponsored Policy">
      <p className="c360-lede">
        Commercial partners may sponsor placements, programmes, Opportunities, Events or Campus Guide
        features. Commercial teams track deliverables but do not edit journalism, sources or
        verification.
      </p>
      <p>
        Paid promotion does not bypass Opportunity verification. Sponsored features should be
        disclosed. Enquiries: <a href="/advertise">Advertise</a>.
      </p>
    </LegalPage>
  );
}
