import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corrections Policy',
  description: 'How Campus 360 handles corrections.',
};

export default function CorrectionsPage() {
  return (
    <LegalPage kicker="Governance" title="Corrections Policy">
      <p className="c360-lede">
        When we get something wrong, we correct it clearly. Material corrections should be noted on
        the story and recorded internally.
      </p>
      <p>
        Report an error via <a href="/contact">Contact</a> or <a href="/tip">Submit a Tip</a> with
        the URL and what should change.
      </p>
    </LegalPage>
  );
}
