import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { resendVerification } from '../data/auth';
import { useAuth } from '../data/useAuth';

/**
 * Výzva k ověření e-mailu. Uživatele nikam nepouští ani neblokuje — aplikace
 * funguje dál, jen tu visí pruh, dokud e-mail není ověřený.
 */
export function EmailVerificationBanner() {
  const { user, emailVerified, refresh } = useAuth();
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

  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0 }}
      action={
        <Stack direction="row" spacing={1}>
          <Button
            color="inherit"
            size="small"
            disabled={busy || sent}
            onClick={() => void resend()}
          >
            {sent ? 'Odesláno' : 'Poslat znovu'}
          </Button>
          <Button color="inherit" size="small" onClick={() => void refresh()}>
            Už jsem ověřil
          </Button>
        </Stack>
      }
    >
      Ověřte svůj e-mail {user.email} — poslali jsme na něj odkaz.
    </Alert>
  );
}
