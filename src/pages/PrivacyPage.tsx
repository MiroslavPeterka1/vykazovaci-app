import { LegalDocument } from '../components/LegalDocument';
import { PRIVACY_EFFECTIVE_FROM, privacySections } from '../content/privacy';

export function PrivacyPage() {
  return (
    <LegalDocument
      title="Zásady ochrany osobních údajů"
      effectiveFrom={PRIVACY_EFFECTIVE_FROM}
      sections={privacySections}
    />
  );
}
