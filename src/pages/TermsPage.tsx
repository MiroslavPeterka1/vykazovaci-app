import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TERMS_EFFECTIVE_FROM, termsSections } from '../content/terms';
import { layout } from '../theme';

export function TermsPage() {
  return (
    <Paper sx={{ maxWidth: layout.termsMaxWidth, p: { xs: 3, sm: 5 } }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>
        Podmínky použití
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Účinné od {TERMS_EFFECTIVE_FROM}. Návrh k právní revizi.
      </Typography>
      <Stack spacing={3}>
        {termsSections.map((section) => (
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
