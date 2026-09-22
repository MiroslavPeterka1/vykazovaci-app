import { useCallback, useState } from 'react';

import { useSnackbar } from './useSnackbar';

export interface AsyncAction {
  busy: boolean;
  /**
   * Spustí zápis a ohlídá jeho průběh. Vrací true při úspěchu, takže volající
   * může zavřít modál jen tehdy, když se opravdu uložilo.
   */
  run: (action: () => Promise<void>, failureMessage: string) => Promise<boolean>;
}

/**
 * Obal nad zápisovými operacemi.
 *
 * Bez něj zůstal po neúspěšném zápisu modál otevřený a uživatel se nedozvěděl
 * nic — chyba se ztratila. Technický detail jde do konzole, uživatel dostane
 * srozumitelnou hlášku.
 */
export function useAsyncAction(): AsyncAction {
  const notify = useSnackbar();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (action: () => Promise<void>, failureMessage: string) => {
      setBusy(true);
      try {
        await action();
        return true;
      } catch (error) {
        console.error(failureMessage, error);
        notify(failureMessage);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [notify],
  );

  return { busy, run };
}
