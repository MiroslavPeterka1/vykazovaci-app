import { createContext } from 'react';

export type ShowMessage = (message: string) => void;

export const SnackbarContext = createContext<ShowMessage | null>(null);
