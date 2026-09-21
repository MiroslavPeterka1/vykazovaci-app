import { useContext } from 'react';

import { SnackbarContext, type ShowMessage } from './snackbarContext';

/** Krátké potvrzení akce vlevo dole — „Činnost ukončena“, „Zákazník uložen“ apod. */
export function useSnackbar(): ShowMessage {
  const show = useContext(SnackbarContext);
  if (!show) throw new Error('useSnackbar musí být uvnitř <SnackbarProvider>.');
  return show;
}
