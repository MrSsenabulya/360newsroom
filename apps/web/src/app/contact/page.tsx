import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Campus 360.',
};

export default function ContactPage() {
  return (
    <LegalPage kicker="Governance" title="Contact">
      <p className="c360-lede">
        For news tips use <a href="/tip">Submit a Tip</a>. For sponsorship use{' '}
        <a href="/advertise">Advertise</a>.
      </p>
      <p>
        Editorial and partnership routes will publish a public email when the production domain is
        live. Until then, use the tip and advertise forms — both create tracked internal records.
      </p>
    </LegalPage>
  );
}
