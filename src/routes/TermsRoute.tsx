import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { AppShell } from '../components/AppShell';
import { useAuth } from '../data/useAuth';
import { TermsPage } from '../pages/TermsPage';

/**
 * Podmínky musí být dostupné i nepřihlášenému uživateli — odkazuje na ně
 * registrační formulář. Přihlášenému se ukážou uvnitř aplikace, ostatním
 * samostatně.
 */
export function TermsRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return (
      <AppShell>
        <TermsPage />
      </AppShell>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <TermsPage />
    </Box>
  );
}
