import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TermsSection } from '../content/terms';
import { layout } from '../theme';

export interface LegalDocumentProps {
  title: string;
  effectiveFrom: string;
  sections: TermsSection[];
}

/**
 * Sdílené vykreslení právních textů — podmínek i zásad ochrany údajů.
 *
 * Poznámka „návrh k právní revizi“ patří do zdrojáku a do zprávy provozovateli,
 * ne na stránku, kterou čtou uživatelé.
 */
export function LegalDocument({ title, effectiveFrom, sections }: LegalDocumentProps) {
  return (
    <Paper sx={{ maxWidth: layout.termsMaxWidth, p: { xs: 3, sm: 5 } }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Účinné od {effectiveFrom}.
      </Typography>
      <Stack spacing={3}>
        {sections.map((section) => (
          <Box key={section.heading}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {section.heading}
            </Typography>
            <Typography sx={{ lineHeight: 1.7, color: 'rgba(0,0,0,0.75)' }}>
              {section.body}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
