import { createContext } from 'react';
import type { User } from 'firebase/auth';

import type { UserProfile } from '../domain/types';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  /** true, dokud Firebase nerozhodne, jestli je někdo přihlášený */
  loading: boolean;
  /** Ověřený e-mail, nebo účet přes Google — v obou případech se výzva nezobrazuje. */
  emailVerified: boolean;
  /** Znovu načte stav uživatele; používá pruh s výzvou k ověření e-mailu. */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
