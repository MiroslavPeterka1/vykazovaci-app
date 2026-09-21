import { useCallback, useState, type ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';

import { SnackbarContext } from './snackbarContext';

/** Doba zobrazení odpovídá návrhu. */
const AUTO_HIDE_MS = 2600;

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((next: string) => setMessage(next), []);

  return (
    <SnackbarContext.Provider value={show}>
      {children}
      <Snackbar
        open={message !== null}
        message={message}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </SnackbarContext.Provider>
  );
}
