import { LegalPage } from '../../components/legal-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms for using Campus 360.',
};

export default function TermsPage() {
  return (
    <LegalPage kicker="Governance" title="Terms of use">
      <p className="c360-lede">
        Campus 360 publishes campus news, programmes and utility information. Content is provided
        for information; verify critical deadlines and official university notices at the source.
      </p>
      <p>
        Do not misuse submission forms, scrape aggressively, or attempt unauthorized access to
        Newsroom or Control. Marketplace checkout and native apps are out of V1 scope.
      </p>
    </LegalPage>
  );
}
