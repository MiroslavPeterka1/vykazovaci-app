import { LegalDocument } from '../components/LegalDocument';
import { TERMS_EFFECTIVE_FROM, termsSections } from '../content/terms';

export function TermsPage() {
  return (
    <LegalDocument
      title="Podmínky použití"
      effectiveFrom={TERMS_EFFECTIVE_FROM}
      sections={termsSections}
    />
  );
}
