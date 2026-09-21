import { useContext } from 'react';

import { AuthContext, type AuthState } from './authContext';

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error('useAuth musí být uvnitř <AuthProvider>.');
  return state;
}
