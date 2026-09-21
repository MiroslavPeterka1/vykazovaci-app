import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { resendVerification } from '../data/auth';
import { useAuth } from '../data/useAuth';

/**
 * Výzva k ověření e-mailu. Uživatele nikam nepouští ani neblokuje — aplikace
 * funguje dál, jen tu visí pruh, dokud e-mail není ověřený.
 */
export function EmailVerificationBanner() {
  const { user, emailVerified, refresh } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user || emailVerified) return null;

  async function resend() {
    setBusy(true);
    try {
      await resendVerification();
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  const actions = (
    <Stack direction="row" spacing={1}>
      <Button color="inherit" size="small" disabled={busy || sent} onClick={() => void resend()}>
        {sent ? 'Odesláno' : 'Poslat znovu'}
      </Button>
      <Button color="inherit" size="small" onClick={() => void refresh()}>
        Už jsem ověřil
      </Button>
    </Stack>
  );

  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0, '& .MuiAlert-message': { minWidth: 0, width: '100%' } }}
      // Na úzké obrazovce se tlačítka vedle textu nevejdou a lámou se po slovech,
      // proto jdou pod text.
      action={isMobile ? undefined : actions}
    >
      <Box sx={{ overflowWrap: 'anywhere' }}>
        Ověřte svůj e-mail {user.email} — poslali jsme na něj odkaz.
      </Box>
      {isMobile && <Box sx={{ mt: 1 }}>{actions}</Box>}
    </Alert>
  );
}
