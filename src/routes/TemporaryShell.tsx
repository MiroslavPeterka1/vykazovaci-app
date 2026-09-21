import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, Outlet } from 'react-router-dom';

import { EmailVerificationBanner } from '../components/EmailVerificationBanner';
import { logout } from '../data/auth';
import { useAuth } from '../data/useAuth';

/**
 * DOČASNÉ. Etapa 3 tohle nahradí skutečným AppShellem (levé menu, AppBar,
 * footer, spodní navigace na mobilu). Zatím jen drží přihlášený stav, aby
 * šla autentizace proklikat.
 */
export function TemporaryShell() {
  const { user, profile } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <EmailVerificationBanner />
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 3, maxWidth: 640 }}>
          <Typography variant="subtitle1">
            Přihlášen: {profile?.displayName || user?.displayName || '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user?.email} · souhlas s podmínkami verze {profile?.termsVersion || '—'}
          </Typography>
          <Button variant="outlined" onClick={() => void logout()}>
            Odhlásit se
          </Button>
          <Button component={RouterLink} to="/podminky" sx={{ ml: 1 }}>
            Podmínky použití
          </Button>
        </Paper>
        <Outlet />
      </Box>
    </Box>
  );
}
