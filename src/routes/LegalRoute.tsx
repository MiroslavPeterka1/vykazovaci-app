import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { AppShell } from '../components/AppShell';
import { useAuth } from '../data/useAuth';

/**
 * Právní texty musí být dostupné i nepřihlášenému uživateli — odkazuje na ně
 * registrační formulář a na zásady ochrany údajů i Google OAuth consent screen.
 * Přihlášenému se ukážou uvnitř aplikace, ostatním samostatně.
 */
export function LegalRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) return <AppShell>{children}</AppShell>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      {children}
    </Box>
  );
}
